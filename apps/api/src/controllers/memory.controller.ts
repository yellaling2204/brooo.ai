import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { RAGService } from '../services/ragService';

const ragService = new RAGService();

export async function getMemoryStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('memories')
      .select('category')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
    }

    const stats = {
      career: 0,
      documents: 0,
      dates: 0,
      preferences: 0,
      general: 0,
      total: data?.length || 0,
    };

    for (const item of data || []) {
      const cat = item.category as keyof typeof stats;
      if (stats[cat] !== undefined) {
        stats[cat]++;
      }
    }

    return res.status(200).json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function queryMemories(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { q, category } = req.query;

    if (q) {
      const results = await ragService.searchMemories(userId, q as string, 10, 0.5);
      return res.status(200).json({ success: true, data: results });
    }

    let query = supabaseAdmin
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category as string);
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

export async function clearMemories(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const { error } = await supabaseAdmin
      .from('memories')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'CLEAR_MEMORIES',
      resource_type: 'memories',
    });

    return res.status(200).json({ success: true, message: 'All memories cleared successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

