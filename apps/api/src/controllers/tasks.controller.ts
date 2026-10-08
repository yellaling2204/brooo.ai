import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export async function listTasks(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { completed } = req.query;

    let query = supabaseAdmin
      .from('tasks')
      .select('*, actions(type, priority)')
      .eq('user_id', userId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (completed !== undefined) {
      query = query.eq('is_completed', completed === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, notes, dueDate, priority = 'medium' } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        notes,
        due_date: dueDate,
        priority,
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

export async function updateTask(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { isCompleted, title, notes, dueDate } = req.body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (isCompleted !== undefined) {
      updates.is_completed = isCompleted;
      updates.completed_at = isCompleted ? new Date().toISOString() : null;
    }
    if (title !== undefined) updates.title = title;
    if (notes !== undefined) updates.notes = notes;
    if (dueDate !== undefined) updates.due_date = dueDate;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

