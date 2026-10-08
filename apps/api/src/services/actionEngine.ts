import { getAIProvider } from '../ai';
import { BroooExtractionResponseSchema, BroooExtractionResponse } from '@brooo/validation';
import { supabaseAdmin } from '../config/supabase';

export const BROOO_EXTRACTOR_SYSTEM_PROMPT = `
You are the core intelligence of brooo.ai — the AI Life Operating System.
Your job is to read raw input (text messages, email receipts, screenshots, documents) and extract:
1. category: (career, finance, insurance, education, government, bills, personal, scam_risk, other)
2. overall_summary: friendly, concise summary in brooo voice ("Got it brooo. Found an interview with XYZ on Monday at 11 AM.")
3. is_suspicious: boolean (true if phishing, fake job, asking for money urgently, unverified payment links)
4. suspicion_reasons: array of strings detailing any red flags
5. actions: array of action objects with:
   - type: task | reminder | deadline | follow_up | renewal | payment | application | appointment | warning | information
   - title: clear, active headline (e.g. "Prepare for Google Interview", "Pay Electricity Bill")
   - summary: 1-2 sentence context explaining why this matters
   - priority: low | medium | high | urgent
   - date: YYYY-MM-DD if explicit date is stated or clearly implied, else null. (NEVER guess dates).
   - time: HH:mm in 24h format if explicit time is stated (e.g. "11:00" for 11 AM), else null. (NEVER invent minutes or seconds).
   - confidence: float between 0.0 and 1.0
   - requires_confirmation: boolean (true if irreversible, financial, or sensitive)
   - entities: key-value dictionary (company, role, amount, date, time, location, etc.)
6. memories_to_store: array of long-term facts:
   - category: career | documents | dates | preferences | general
   - key: optional identifier string
   - value: clear fact to remember

Respond strictly with valid JSON conforming to the schema.
`;

export function resolveDeterministicDeadline(date?: string | null, time?: string | null, fallbackDeadline?: string | null): string | null {
  if (date) {
    const formattedTime = time && /^\d{1,2}:\d{2}$/.test(time) 
      ? (time.length === 4 ? `0${time}:00.000Z` : `${time}:00.000Z`) 
      : '09:00:00.000Z';
    return `${date}T${formattedTime}`;
  }
  if (fallbackDeadline) {
    try {
      const d = new Date(fallbackDeadline);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
  }
  return null;
}

export interface ProcessInputParams {
  userId: string;
  sourceId: string;
  documentId?: string | null;
  rawText: string;
  images?: Array<{ mimeType: string; base64: string }>;
  tier?: 'fast' | 'complex';
}

export class ActionEngineService {
  private aiProvider = getAIProvider();

  async processInput(params: ProcessInputParams): Promise<{
    extraction: BroooExtractionResponse;
    actionIds: string[];
  }> {
    const { userId, sourceId, documentId, rawText, images, tier = 'fast' } = params;

    // 1. Run AI analysis through unified provider
    const aiResponse = await this.aiProvider.analyze({
      tier,
      systemPrompt: BROOO_EXTRACTOR_SYSTEM_PROMPT,
      userPrompt: rawText || 'Analyze the provided image/document.',
      images,
    });

    // 2. Validate structured output through Zod schema
    const parseResult = BroooExtractionResponseSchema.safeParse(aiResponse.data);
    const extraction: BroooExtractionResponse = parseResult.success
      ? parseResult.data
      : {
          category: 'other',
          overall_summary: 'Processed input brooo.',
          is_suspicious: false,
          suspicion_reasons: [],
          actions: [],
          memories_to_store: [],
        };

    const actionIds: string[] = [];

    // 3. Persist extracted actions
    for (const act of extraction.actions) {
      // Risk check & confirmation rules
      const requiresConfirmation =
        act.requires_confirmation ||
        act.type === 'payment' ||
        act.type === 'renewal' ||
        extraction.is_suspicious;

      const resolvedDeadline = resolveDeterministicDeadline(act.date, act.time, act.deadline);

      const actionEntities = {
        ...(act.entities || {}),
        ...(act.date ? { date: act.date } : {}),
        ...(act.time ? { time: act.time } : {}),
      };

      const { data: insertedAction, error: actionError } = await supabaseAdmin
        .from('actions')
        .insert({
          user_id: userId,
          source_id: sourceId,
          document_id: documentId,
          type: act.type,
          title: act.title,
          summary: act.summary,
          priority: act.priority,
          deadline: resolvedDeadline,
          confidence: act.confidence,
          requires_confirmation: requiresConfirmation,
          entities: actionEntities,
          status: 'pending',
        })
        .select('id')
        .single();

      if (!actionError && insertedAction) {
        actionIds.push(insertedAction.id);

        // If it does not require confirmation, auto-create a task or reminder
        if (!requiresConfirmation) {
          if (act.type === 'task' || act.type === 'application' || act.type === 'follow_up') {
            await supabaseAdmin.from('tasks').insert({
              user_id: userId,
              action_id: insertedAction.id,
              title: act.title,
              notes: act.summary,
              due_date: resolvedDeadline,
              priority: act.priority,
            });
          }

          if (resolvedDeadline && (act.type === 'reminder' || act.type === 'appointment' || act.type === 'deadline')) {
            await supabaseAdmin.from('reminders').insert({
              user_id: userId,
              action_id: insertedAction.id,
              title: act.title,
              scheduled_at: resolvedDeadline,
              status: 'pending',
            });
          }
        }
      }
    }

    // 4. Persist structured & semantic memories
    if (extraction.memories_to_store && extraction.memories_to_store.length > 0) {
      const memoryTexts = extraction.memories_to_store.map((m) => m.value);
      const embeddings = await this.aiProvider.generateEmbeddings({ texts: memoryTexts });

      for (let i = 0; i < extraction.memories_to_store.length; i++) {
        const mem = extraction.memories_to_store[i];
        const emb = embeddings[i] || null;

        await supabaseAdmin.from('memories').insert({
          user_id: userId,
          source_id: sourceId,
          type: 'structured',
          category: mem.category,
          key: mem.key,
          value: mem.value,
          embedding: emb,
          confidence: mem.confidence || 1.0,
        });
      }
    }

    // 5. Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'INGEST_PROCESS_COMPLETE',
      resource_type: 'source',
      resource_id: sourceId,
      metadata: {
        actionsCount: actionIds.length,
        category: extraction.category,
        isSuspicious: extraction.is_suspicious,
        modelUsed: aiResponse.modelUsed,
      },
    });

    return {
      extraction,
      actionIds,
    };
  }
}

