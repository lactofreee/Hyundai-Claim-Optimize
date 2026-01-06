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

    if (!session.isLoggedIn || !session.userId) {
      console.warn("[ChatAPI] Message received but user is not logged in");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[ChatAPI] Saving message for userId: ${session.userId}`);

    // 1. Save User Message
    await supabase.from('chat_messages').insert({
      user_id: session.userId,
      role: 'user',
      content: userMessage
    });
    
const N8N_PRODUCTION_URL = `https://saves-atlas-allied-outline.trycloudflare.com/webhook/d272f692-2b9b-4e50-aab0-17d55b04fff2`
const N8N_TEST_URL = `https://saves-atlas-allied-outline.trycloudflare.com/webhook-test/d272f692-2b9b-4e50-aab0-17d55b04fff2`
    
    // Proxy the request to the external webhook
    const externalResponse = await fetch(N8N_PRODUCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        message: userMessage,
        userId: session.userId 
      }),
    });

    if (!externalResponse.ok) {
      const errorData = await externalResponse.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `외부 서버 오류 (${externalResponse.status})`;
      console.error("External Webhook Error:", externalResponse.status, errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: externalResponse.status });
    }

    let data;
    const responseText = await externalResponse.text();
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", responseText);
      return NextResponse.json({ error: `JSON 파싱 실패: ${responseText}` }, { status: 500 });
    }

    // Typical n8n responses are arrays [ { msg: '...' } ]
    const result = Array.isArray(data) ? data[0] : data;
    const aiContent = typeof result === 'string' ? result : (result.msg || result.output || result.message || result.text || result.response || JSON.stringify(result, null, 2));

    // 2. Save Assistant Message
    if (session.isLoggedIn && session.userId) {
      await supabase.from('chat_messages').insert({
        user_id: session.userId,
        role: 'assistant',
        content: aiContent
      });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Proxy Endpoint Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
