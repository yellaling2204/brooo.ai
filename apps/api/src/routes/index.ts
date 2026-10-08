import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { handleInboxSend } from '../controllers/inbox.controller';
import { listActions, confirmAction, updateActionStatus } from '../controllers/actions.controller';
import { listTasks, createTask, updateTask } from '../controllers/tasks.controller';
import { listReminders, createReminder } from '../controllers/reminders.controller';
import { handleChatMessage } from '../controllers/chat.controller';
import { getMemoryStats, queryMemories, clearMemories } from '../controllers/memory.controller';
import { supabaseAdmin } from '../config/supabase';

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
});

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'brooo-ai-api', timestamp: new Date().toISOString() });
});

// Protected routes (Supabase Auth guarded)
apiRouter.use(requireAuth);

// 1. Ingestion / AI Inbox
apiRouter.post('/inbox/send', upload.single('file'), handleInboxSend);

// 2. Action Engine
apiRouter.get('/actions', listActions);
apiRouter.post('/actions/:id/confirm', confirmAction);
apiRouter.patch('/actions/:id', updateActionStatus);

// 3. Tasks
apiRouter.get('/tasks', listTasks);
apiRouter.post('/tasks', createTask);
apiRouter.patch('/tasks/:id', updateTask);

// 4. Reminders
apiRouter.get('/reminders', listReminders);
apiRouter.post('/reminders', createReminder);

// 5. AI Chat OS
apiRouter.post('/chat/message', handleChatMessage);

// 6. Memory Store
apiRouter.get('/memory/stats', getMemoryStats);
apiRouter.get('/memory', queryMemories);
apiRouter.delete('/memory', clearMemories);

// 7. Security & GDPR Account Data Deletion
apiRouter.delete('/user/data', async (req, res) => {
  try {
    const userId = req.user!.id;
    // Cascade delete user data
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'ACCOUNT_DATA_PURGE_REQUESTED',
      resource_type: 'user',
    });

    // Delete records across all tables
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    res.status(200).json({ success: true, message: 'All personal data deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'PURGE_FAILED', message: err.message } });
  }
});

