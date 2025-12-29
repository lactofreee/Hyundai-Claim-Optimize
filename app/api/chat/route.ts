import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/actions/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const body = await request.json();
    const userMessage = body.message;

    // 1. Save User Message
    if (session.isLoggedIn && session.userId) {
      await supabase.from('chat_messages').insert({
        user_id: session.userId,
        role: 'user',
        content: userMessage
      });
    }
    
    // Proxy the request to the external webhook
    const externalResponse = await fetch("https://saves-atlas-allied-outline.trycloudflare.com/webhook-test/d272f692-2b9b-4e50-aab0-17d55b04fff2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!externalResponse.ok) {
      console.error("External Webhook Error:", externalResponse.status, externalResponse.statusText);
      return NextResponse.json({ error: 'Failed to fetch from external webhook' }, { status: externalResponse.status });
    }

    const data = await externalResponse.json();
    const aiContent = typeof data === 'string' ? data : (data.msg || data.output || data.message || data.text || data.response || JSON.stringify(data, null, 2));

    // 2. Save Assistant Message
    if (session.isLoggedIn && session.userId) {
      await supabase.from('chat_messages').insert({
        user_id: session.userId,
        role: 'assistant',
        content: aiContent
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy Endpoint Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
