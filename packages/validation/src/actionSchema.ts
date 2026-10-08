import { z } from 'zod';

export const ActionTypeEnum = z.enum([
  'task',
  'reminder',
  'deadline',
  'follow_up',
  'renewal',
  'payment',
  'application',
  'appointment',
  'warning',
  'information',
]);

export const PriorityLevelEnum = z.enum(['low', 'medium', 'high', 'urgent']);

export const DocumentCategoryEnum = z.enum([
  'career',
  'finance',
  'insurance',
  'education',
  'government',
  'bills',
  'personal',
  'scam_risk',
  'other',
]);

export const MemoryCategoryEnum = z.enum([
  'career',
  'documents',
  'dates',
  'preferences',
  'general',
]);

export const ExtractedActionSchema = z.object({
  type: ActionTypeEnum.describe('The specific action type required'),
  title: z.string().min(1).describe("Concise actionable headline, e.g. 'Submit Google Application'"),
  summary: z.string().optional().describe('1-2 sentences on context and why this matters'),
  priority: PriorityLevelEnum.default('medium').describe('Urgency level based on deadlines and stakes'),
  date: z.string().nullable().optional().describe('YYYY-MM-DD if explicit date is stated or clearly implied, else null. DO NOT guess.'),
  time: z.string().nullable().optional().describe('HH:mm in 24h format if explicit time is stated (e.g. 11:00 for 11 AM), else null. DO NOT guess.'),
  deadline: z.string().nullable().optional().describe('ISO 8601 string or fallback if directly provided, else null'),
  confidence: z.number().min(0).max(1).default(1.0).describe('Confidence score between 0.0 and 1.0'),
  requires_confirmation: z.boolean().default(false).describe('True if sensitive, financial, or requiring explicit approval'),
  entities: z.record(z.any()).default({}).describe('Extracted key entities: company, role, amount, date, time, location'),
});

export const ExtractedMemorySchema = z.object({
  category: MemoryCategoryEnum.describe('Domain for memory indexing'),
  key: z.string().optional().describe('Optional key, e.g. target_role or insurance_policy_number'),
  value: z.string().min(1).describe('The exact fact to remember for long-term user context'),
  confidence: z.number().min(0).max(1).default(1.0),
});

export const BroooExtractionResponseSchema = z.object({
  category: DocumentCategoryEnum.describe('Primary classification of the input content'),
  overall_summary: z.string().describe('Friendly, concise summary written in brooo voice'),
  is_suspicious: z.boolean().default(false).describe('True if content resembles phishing, payment extortion, or fake job scam'),
  suspicion_reasons: z.array(z.string()).default([]).describe('List of suspicious red flags if any'),
  actions: z.array(ExtractedActionSchema).default([]).describe('List of extracted action objects'),
  memories_to_store: z.array(ExtractedMemorySchema).default([]).describe('Long-term personal facts and preferences to remember'),
});

export type ExtractedAction = z.infer<typeof ExtractedActionSchema>;
export type ExtractedMemory = z.infer<typeof ExtractedMemorySchema>;
export type BroooExtractionResponse = z.infer<typeof BroooExtractionResponseSchema>;

