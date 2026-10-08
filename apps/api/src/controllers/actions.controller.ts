import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export async function listActions(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { status, priority, limit = '50' } = req.query;

    let query = supabaseAdmin
      .from('actions')
      .select('*, sources(type, title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string, 10));

    if (status) {
      query = query.eq('status', status as string);
    }
    if (priority) {
      query = query.eq('priority', priority as string);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: error.message },
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function confirmAction(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { customDueDate, customNotes } = req.body;

    const { data: action, error } = await supabaseAdmin
      .from('actions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !action) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Action not found' },
      });
    }

    // Update action status to confirmed
    await supabaseAdmin
      .from('actions')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', id);

    // Create Task
    const dueDate = customDueDate || action.deadline;
    const { data: createdTask } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        action_id: id,
        title: action.title,
        notes: customNotes || action.summary,
        due_date: dueDate,
        priority: action.priority,
      })
      .select()
      .single();

    // If deadline exists, create reminder
    if (dueDate) {
      await supabaseAdmin.from('reminders').insert({
        user_id: userId,
        action_id: id,
        title: action.title,
        scheduled_at: dueDate,
        status: 'pending',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        actionId: id,
        task: createdTask,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function updateActionStatus(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('actions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: error.message },
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

