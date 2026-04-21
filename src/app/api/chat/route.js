import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = "You are the PetZone Assistant. Warm, brief, professional. Identify user language and respond accordingly.";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const customKey = req.headers.get('x-gemini-key');
    const finalKey = customKey || process.env.GEMINI_API_KEY;

    if (!finalKey || finalKey.trim() === '') {
      return NextResponse.json({ role: 'assistant', content: "يرجى ضبط مفتاح API أولاً." });
    }

    const contents = messages.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text || "" }]
    }));
    
    if (contents.length > 0 && contents[0].role === "model") contents.shift();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${finalKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (response.ok) {
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (botText) {
        return NextResponse.json({ role: 'assistant', content: botText });
      }
    }

    // Diagnostic fallback for specific errors
    const errorMsg = data.error?.message || "Connection failed";
    return NextResponse.json({ 
      role: 'assistant', 
      content: `عذراً، هناك مشكلة في المفتاح المستخدم: ${errorMsg}` 
    });

  } catch (error) {
    return NextResponse.json({ role: 'assistant', content: 'حدث خطأ غير متوقع.' });
  }
}
