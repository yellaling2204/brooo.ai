import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { getAIProvider } from '../ai';
import { RAGService } from '../services/ragService';

const ragService = new RAGService();
const aiProvider = getAIProvider();

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { conversationId, message } = req.body;

    // 1. Fetch user context
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, interests')
      .eq('id', userId)
      .single();

    // 2. Fetch active tasks & upcoming actions
    const { data: activeTasks } = await supabaseAdmin
      .from('tasks')
      .select('title, due_date, priority')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .limit(5);

    const { data: upcomingActions } = await supabaseAdmin
      .from('actions')
      .select('title, type, deadline, priority')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(5);

    // 3. Retrieve relevant memories via RAG
    const relevantMemories = await ragService.searchMemories(userId, message, 3, 0.6);

    // 4. Ensure conversation exists
    let activeConvoId = conversationId;
    if (!activeConvoId) {
      const { data: newConvo } = await supabaseAdmin
        .from('conversations')
        .insert({ user_id: userId, title: message.slice(0, 40) })
        .select('id')
        .single();
      activeConvoId = newConvo?.id;
    }

    // Record user message
    if (activeConvoId) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: activeConvoId,
        user_id: userId,
        role: 'user',
        content: message,
      });
    }

    // 5. Construct Contextual OS prompt
    const systemPrompt = `
You are brooo.ai — the user's personal AI Life OS and digital bro.
Tone: Friendly, intelligent, capable, calm, slightly playful. Like a reliable brother who has everything handled.
User name: ${profile?.name || 'Friend'}

User's current state:
- Active Tasks: ${JSON.stringify(activeTasks || [])}
- Upcoming Actions/Deadlines: ${JSON.stringify(upcomingActions || [])}
- Long-term Memories: ${JSON.stringify(relevantMemories.map((m) => m.value))}

Answer the user directly and proactively. If they ask about deadlines, schedules, documents, or tasks, give them clear specifics.
Format your output as JSON:
{
  "reply": "Your response in brooo tone",
  "suggested_actions": [
    { "title": "Example Action", "type": "task" | "reminder" }
  ]
}
`;

    const aiRes = await aiProvider.analyze({
      tier: 'fast',
      systemPrompt,
      userPrompt: message,
    });

    const reply = aiRes.data.reply || aiRes.rawText || "I'm on it brooo.";
    const suggestedActions = aiRes.data.suggested_actions || [];

    // Record assistant reply
    if (activeConvoId) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: activeConvoId,
        user_id: userId,
        role: 'assistant',
        content: reply,
        suggested_actions: suggestedActions,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        conversationId: activeConvoId,
        reply,
        suggestedActions,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CHAT_ERROR', message: err.message },
    });
  }
}

