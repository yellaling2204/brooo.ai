import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export async function listReminders(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select('*, actions(title, priority)')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function createReminder(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, scheduledAt, actionId } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reminders')
      .insert({
        user_id: userId,
        action_id: actionId || null,
        title,
        scheduled_at: scheduledAt,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }

    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

