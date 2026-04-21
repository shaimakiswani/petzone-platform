import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `DEVELOPER_NOTE: You are the PetZone Assistant. Warm, professional, concise.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const customKey = req.headers.get('x-gemini-key');
    const finalKey = customKey || process.env.GEMINI_API_KEY;

    if (!finalKey || finalKey.trim() === '') {
      return NextResponse.json({ role: 'assistant', content: "يرجى ضبط مفتاح API أولاً." });
    }

    // User-requested models in priority order
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash" 
    ];

    const contents = messages.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text }]
    }));
    if (contents.length > 0 && contents[0].role === "model") contents.shift();

    // Context Injection
    if (contents.length > 0) {
        contents[0].parts[0].text = `${SYSTEM_PROMPT}\n\nUser Question: ${contents[0].parts[0].text}`;
    }

    for (const modelId of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${finalKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (response.ok) {
          const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
          return NextResponse.json({ role: 'assistant', content: botText });
        }
      } catch (err) {
        console.warn(`Fallback: ${modelId} failed, trying next...`);
      }
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: "عذراً، نظام المساعد الذكي يواجه تقلبات فنية حالياً. يرجى المحاولة بعد قليل." 
    });

  } catch (error) {
    return NextResponse.json({ role: 'assistant', content: 'تحذير: حدث خطأ غير متوقع في الاتصال.' });
  }
}
