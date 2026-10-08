import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { supabaseAdmin } from '../config/supabase';
import { ActionEngineService } from '../services/actionEngine';

const actionEngine = new ActionEngineService();

export async function handleInboxSend(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { type, content, title } = req.body;
    const file = req.file;

    let rawText = content || '';
    let images: Array<{ mimeType: string; base64: string }> = [];
    let sourceType: 'text' | 'image' | 'pdf' = 'text';
    let documentId: string | null = null;

    if (file) {
      if (file.mimetype.startsWith('image/')) {
        sourceType = 'image';
        images.push({
          mimeType: file.mimetype,
          base64: file.buffer.toString('base64'),
        });
        rawText = content ? `${content}\n[Attached Screenshot]` : 'Please extract all actionable information from this screenshot.';
      } else if (file.mimetype === 'application/pdf') {
        sourceType = 'pdf';
        try {
          const parsedPdf = await pdfParse(file.buffer);
          rawText = parsedPdf.text || content || '';
        } catch (pdfErr) {
          rawText = content || 'Uploaded PDF document';
        }
      }

      // Store file in documents table (using admin client)
      const storagePath = `user_${userId}/${Date.now()}_${file.originalname}`;
      const { data: docRecord } = await supabaseAdmin
        .from('documents')
        .insert({
          user_id: userId,
          file_name: file.originalname,
          file_type: file.mimetype,
          storage_path: storagePath,
          extracted_text: rawText,
          status: 'processed',
        })
        .select('id')
        .single();

      if (docRecord) {
        documentId = docRecord.id;
      }
    } else {
      sourceType = 'text';
    }

    // 1. Create source record
    const { data: sourceRecord, error: sourceErr } = await supabaseAdmin
      .from('sources')
      .insert({
        user_id: userId,
        type: sourceType,
        title: title || (file ? file.originalname : 'Quick Text Note'),
        raw_content: rawText,
      })
      .select('id')
      .single();

    if (sourceErr || !sourceRecord) {
      return res.status(500).json({
        success: false,
        error: { code: 'SOURCE_CREATION_FAILED', message: 'Failed to record incoming source' },
      });
    }

    // 2. Process through AI Action Engine
    const { extraction, actionIds } = await actionEngine.processInput({
      userId,
      sourceId: sourceRecord.id,
      documentId,
      rawText,
      images,
      tier: sourceType === 'pdf' ? 'complex' : 'fast',
    });

    // 3. Fetch full created action records to return to client
    const { data: createdActions } = await supabaseAdmin
      .from('actions')
      .select('*')
      .in('id', actionIds);

    return res.status(200).json({
      success: true,
      data: {
        sourceId: sourceRecord.id,
        documentId,
        summary: extraction.overall_summary,
        category: extraction.category,
        isSuspicious: extraction.is_suspicious,
        suspicionReasons: extraction.suspicion_reasons,
        actions: createdActions || [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INBOX_PROCESSING_ERROR', message: err.message },
    });
  }
}

