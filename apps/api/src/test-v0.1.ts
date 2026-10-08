import fs from 'fs';
import path from 'path';
import { ActionEngineService, formatBroooMessage } from './services/actionEngine';
import { BroooExtractionResponseSchema } from '@brooo/validation';
import { supabaseAdmin } from './config/supabase';

async function runV01TestSuite() {
  console.log('================================================================');
  console.log('📸 brooo.ai — Milestone V0.1: Screenshot -> Vision -> Action');
  console.log('================================================================\n');

  const actionEngine = new ActionEngineService();
  const imagesDir = path.resolve(process.cwd(), '../../tests/images');

  // Verify test user exists in DB
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const testUser = users?.users?.[0];
  const userId = testUser ? testUser.id : '17c8216f-74a7-49ec-8106-9e1b4a592732';

  const testCases = [
    {
      id: '01',
      file: '01-interview.png',
      expectedCategory: 'career',
      expectedType: 'appointment',
      description: 'Job Interview Screenshot (ABC Technologies)',
      check: (data: any) => {
        const act = data.actions[0];
        if (!act) throw new Error('No actions found in extraction');
        if (data.category !== 'career') throw new Error(`Expected category career, got ${data.category}`);
        if (!act.title.toLowerCase().includes('interview')) throw new Error(`Title missing interview: ${act.title}`);
        if (act.date !== '2026-10-12') throw new Error(`Expected date 2026-10-12, got ${act.date}`);
        if (act.time !== '11:00') throw new Error(`Expected time 11:00, got ${act.time}`);
        if (act.priority !== 'high') throw new Error(`Expected priority high, got ${act.priority}`);
      },
    },
    {
      id: '02',
      file: '02-job-description.png',
      expectedCategory: 'career',
      expectedType: 'application',
      description: 'Job Description Screenshot (Acme Corp Backend Engineer)',
      check: (data: any) => {
        const act = data.actions[0];
        if (!act) throw new Error('No actions found in extraction');
        if (data.category !== 'career') throw new Error(`Expected category career, got ${data.category}`);
        if (!act.entities?.company?.includes('Acme')) throw new Error(`Missing company Acme: ${JSON.stringify(act.entities)}`);
        if (!act.entities?.role?.includes('Backend')) throw new Error(`Missing role Backend: ${JSON.stringify(act.entities)}`);
        if (!act.entities?.salary) throw new Error(`Missing salary: ${JSON.stringify(act.entities)}`);
      },
    },
    {
      id: '03',
      file: '03-insurance.png',
      expectedCategory: 'insurance',
      expectedType: 'renewal',
      description: 'Insurance Policy Notice Screenshot (SafeGuard)',
      check: (data: any) => {
        const act = data.actions[0];
        if (!act) throw new Error('No actions found in extraction');
        if (data.category !== 'insurance') throw new Error(`Expected category insurance, got ${data.category}`);
        if (act.type !== 'renewal') throw new Error(`Expected type renewal, got ${act.type}`);
        if (act.date !== '2026-11-15') throw new Error(`Expected date 2026-11-15, got ${act.date}`);
        if (!act.entities?.policy_number?.includes('POL-77492')) throw new Error(`Missing policy number`);
      },
    },
    {
      id: '04',
      file: '04-bill.png',
      expectedCategory: 'bills',
      expectedType: 'payment',
      description: 'Utility Bill Statement Screenshot (Apex Power)',
      check: (data: any) => {
        const act = data.actions[0];
        if (!act) throw new Error('No actions found in extraction');
        if (data.category !== 'bills') throw new Error(`Expected category bills, got ${data.category}`);
        if (act.type !== 'payment') throw new Error(`Expected type payment, got ${act.type}`);
        if (!act.entities?.amount_due?.includes('124.50')) throw new Error(`Missing amount due 124.50: ${JSON.stringify(act.entities)}`);
        if (act.date !== '2026-10-25') throw new Error(`Expected date 2026-10-25, got ${act.date}`);
      },
    },
    {
      id: '05',
      file: '05-scam-message.png',
      expectedCategory: 'scam_risk',
      expectedType: 'warning',
      description: 'Phishing Scam Message Screenshot (Lottery Phishing)',
      check: (data: any) => {
        if (!data.is_suspicious) throw new Error('Expected is_suspicious to be true!');
        if (data.suspicion_reasons.length === 0) throw new Error('Expected suspicion reasons!');
        const act = data.actions[0];
        if (!act || act.type !== 'warning') throw new Error('Expected warning action for scam');
        if (act.priority !== 'urgent') throw new Error('Expected urgent priority for scam');
      },
    },
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    const filePath = path.join(imagesDir, tc.file);
    console.log(`\n----------------------------------------------------------------`);
    console.log(`🧪 Test ${tc.id}: ${tc.description}`);
    console.log(`📁 File: ${tc.file} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);

    const imageBuffer = fs.readFileSync(filePath);
    const imageBase64 = imageBuffer.toString('base64');

    // 1. Record source in Supabase
    const { data: source } = await supabaseAdmin
      .from('sources')
      .insert({
        user_id: userId,
        type: 'image',
        title: tc.file,
        raw_content: `[Attached Screenshot: ${tc.file}]`,
      })
      .select('id')
      .single();

    const sourceId = source ? source.id : '00000000-0000-0000-0000-000000000000';

    // 2. Process via unified Action Engine
    const startTime = Date.now();
    const result = await actionEngine.processInput({
      userId,
      sourceId,
      rawText: `[Attached Screenshot: ${tc.file}]`,
      images: [{ mimeType: 'image/png', base64: imageBase64 }],
      tier: 'fast',
    });
    const elapsed = Date.now() - startTime;

    // 3. Schema validation
    const parsed = BroooExtractionResponseSchema.safeParse(result.extraction);
    if (!parsed.success) {
      console.error(`❌ Schema Validation FAILED for ${tc.file}:`, parsed.error);
      process.exit(1);
    }

    // 4. Custom assertions
    try {
      tc.check(result.extraction);
      console.log(`✅ Schema & Extraction Checks Passed (${elapsed}ms)`);
      console.log(`🏷️ Category: ${result.extraction.category.toUpperCase()}`);
      console.log(`🛡️ Suspicious: ${result.extraction.is_suspicious ? '⚠️ YES' : 'No'}`);
      console.log(`🎯 Actions Created: ${result.actionIds.length}`);

      if (result.extraction.actions.length > 0) {
        const act = result.extraction.actions[0];
        console.log(`   📌 Action Title: "${act.title}"`);
        console.log(`   ⚡ Priority:     ${act.priority.toUpperCase()}`);
        if (act.date) console.log(`   📅 Date:         ${act.date} ${act.time || ''}`);
      }

      console.log(`\n💬 Brooo Personality Response:\n"${result.broooMessage}"`);
      passedCount++;
    } catch (err: any) {
      console.error(`❌ Check failed for ${tc.file}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedCount} / ${testCases.length} SCREENSHOT VISION TESTS PASSED PERFECTLY!`);
  console.log('================================================================\n');
}

runV01TestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

