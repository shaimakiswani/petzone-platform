import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = "You are the PetZone Assistant. Warm and professional. Respond in the same language as the user. Keep it brief.";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const customKey = req.headers.get('x-gemini-key');
    let finalKey = customKey || process.env.GEMINI_API_KEY;

    if (!finalKey || finalKey.trim() === '') {
      return NextResponse.json({ role: 'assistant', content: "يرجى ضبط مفتاح API أولاً." });
    }

    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    const contents = messages.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text || "" }]
    }));
    
    if (contents.length > 0 && contents[0].role === "model") contents.shift();

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
          const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (botText) {
            return NextResponse.json({ role: 'assistant', content: botText });
          }
        } else if (response.status === 400 && customKey) {
           // If the custom key failed, try one more time with the system key
           console.warn("Custom key failed, falling back to system key...");
           finalKey = process.env.GEMINI_API_KEY;
           // Restart loop with system key by breaking to outer logic or just retrying here
           const retryUrl = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${finalKey}`;
           const retryResponse = await fetch(retryUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents })
           });
           const retryData = await retryResponse.json();
           if (retryResponse.ok) {
              return NextResponse.json({ role: 'assistant', content: retryData.candidates?.[0]?.content?.parts?.[0]?.text });
           }
        }
      } catch (err) {
        console.warn(`Fallback: ${modelId} failed`);
      }
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: "عذراً، نظام الذكاء الاصطناعي لا يستجيب حالياً. تأكد من صحة مفتاح API المحفوظ في الإعدادات." 
    });

  } catch (error) {
    return NextResponse.json({ role: 'assistant', content: 'حدث خطأ في النظام.' });
  }
}
