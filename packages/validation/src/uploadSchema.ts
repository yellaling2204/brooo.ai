import { z } from 'zod';

export const IngestTextInputSchema = z.object({
  type: z.literal('text'),
  content: z.string().min(1, 'Content cannot be empty'),
  title: z.string().optional(),
});

export const IngestMediaInputSchema = z.object({
  type: z.enum(['image', 'pdf']),
  title: z.string().optional(),
  categoryHint: z.string().optional(),
});

export const ConfirmActionInputSchema = z.object({
  actionId: z.string().uuid(),
  customDueDate: z.string().datetime().optional(),
  customNotes: z.string().optional(),
});

export const UpdateTaskStatusSchema = z.object({
  isCompleted: z.boolean(),
});

export const CreateManualTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const ChatMessageInputSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
});

