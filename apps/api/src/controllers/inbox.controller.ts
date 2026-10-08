import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { supabaseAdmin } from '../config/supabase';
import { ActionEngineService } from '../services/actionEngine';

const actionEngine = new ActionEngineService();

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_MIMES, 'application/pdf'];
const BLOCKED_EXTENSIONS = ['.exe', '.zip', '.js', '.sh', '.bat', '.cmd', '.dll', '.bin', '.msi'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function handleInboxSend(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { type, content, title, imageBase64, imageMimeType } = req.body;
    const file = req.file;

    // Reject invalid file extensions
    if (file) {
      const lowerName = file.originalname.toLowerCase();
      if (BLOCKED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BLOCKED_FILE_EXTENSION',
            message: `Files with executable or archive extensions are not allowed for security reasons.`,
          },
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `Unsupported file type: ${file.mimetype}. Allowed types: PNG, JPEG, WEBP, PDF.`,
          },
        });
      }

      if (file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `Image exceeds maximum allowed size of 10 MB.`,
          },
        });
      }
    }

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
        rawText = content
          ? `${content}\n[Attached Screenshot: ${file.originalname}]`
          : `[Attached Screenshot: ${file.originalname}] Please extract all actionable information from this screenshot.`;
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
    } else if (imageBase64) {
      // Mobile direct base64 upload
      sourceType = 'image';
      const mime = imageMimeType || 'image/jpeg';
      if (!ALLOWED_IMAGE_MIMES.includes(mime)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_IMAGE_TYPE', message: 'Only JPEG, PNG, and WEBP base64 images are supported.' },
        });
      }
      images.push({ mimeType: mime, base64: imageBase64 });
      rawText = content ? `${content}\n[Attached Screenshot]` : 'Please extract all actionable information from this screenshot.';
    } else if (type === 'image' && !file && !imageBase64) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_IMAGE_PAYLOAD', message: 'Image type requested but no image file or base64 provided.' },
      });
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
    const { extraction, actionIds, broooMessage } = await actionEngine.processInput({
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
        broooMessage,
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
