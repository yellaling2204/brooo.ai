import { getAIProvider } from './ai';
import { BROOO_EXTRACTOR_SYSTEM_PROMPT, resolveDeterministicDeadline } from './services/actionEngine';
import { BroooExtractionResponseSchema } from '@brooo/validation';

async function runV0Test() {
  console.log('====================================================');
  console.log('🚀 brooo.ai — Milestone V0: Text -> Action Pipeline');
  console.log('====================================================\n');

  const testInput =
    'My software engineering interview with ABC Technologies is on Monday at 11 AM. I need to prepare for system design and SQL.';

  console.log(`📥 Test Input:\n"${testInput}"\n`);

  const provider = getAIProvider();
  console.log(`🤖 Using AI Provider: ${provider.name}`);

  console.log('⚡ Sending to Action Extraction Engine...');
  const start = Date.now();

  const response = await provider.analyze({
    tier: 'fast',
    systemPrompt: BROOO_EXTRACTOR_SYSTEM_PROMPT,
    userPrompt: testInput,
  });

  const duration = Date.now() - start;
  console.log(`⏱️ Extraction completed in ${duration}ms (Model: ${response.modelUsed})\n`);

  console.log('🔍 Validating output against Zod BroooExtractionResponseSchema...');
  const parseResult = BroooExtractionResponseSchema.safeParse(response.data);

  if (!parseResult.success) {
    console.error('❌ Validation failed:', parseResult.error.format());
    process.exit(1);
  }

  const result = parseResult.data;
  console.log('✅ Zod Schema Validation PASSED!\n');

  console.log('📦 Extracted Structured Output:');
  console.log(JSON.stringify(result, null, 2));

  console.log('\n🎯 Summary of Extracted Actions:');
  result.actions.forEach((act, idx) => {
    console.log(`\n[Action ${idx + 1}]`);
    console.log(`  Type:       ${act.type}`);
    console.log(`  Title:      ${act.title}`);
    console.log(`  Priority:   ${act.priority}`);
    console.log(`  Date:       ${act.date || 'null'}`);
    console.log(`  Time:       ${act.time || 'null'}`);
    console.log(`  UTC (IST):  ${resolveDeterministicDeadline(act.date, act.time, 'Asia/Kolkata')}`);
    console.log(`  Summary:    ${act.summary}`);
    console.log(`  Confidence: ${act.confidence * 100}%`);
    console.log(`  Entities:   ${JSON.stringify(act.entities)}`);
  });

  if (result.memories_to_store.length > 0) {
    console.log('\n🧠 Extracted Long-Term Memories:');
    result.memories_to_store.forEach((m, idx) => {
      console.log(`  ${idx + 1}. [${m.category}] ${m.value}`);
    });
  }

  console.log('\n====================================================');
  console.log('🎉 Milestone V0 Core Pipeline Verification SUCCESS!');
  console.log('====================================================');
}

runV0Test().catch((err) => {
  console.error('Error during V0 test:', err);
  process.exit(1);
});

