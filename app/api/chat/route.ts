import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Proxy the request to the external webhook server-side to bypass CORS
    const externalResponse = await fetch("https://saves-atlas-allied-outline.trycloudflare.com/webhook-test/d272f692-2b9b-4e50-aab0-17d55b04fff2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!externalResponse.ok) {
      console.error("External Webhook Error:", externalResponse.status, externalResponse.statusText);
      return NextResponse.json({ error: 'Failed to fetch from external webhook' }, { status: externalResponse.status });
    }

    const data = await externalResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy Endpoint Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
