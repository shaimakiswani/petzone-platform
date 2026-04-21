import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `DEVELOPER_NOTE: You are the PetZone Assistant. Warm, professional, brief and informative. 
- ALWAYS respond in the SAME LANGUAGE the user is using (e.g., if they speak Arabic, you MUST respond in Arabic).
- Keep responses concise but COMPLETE. Do not cut off mid-sentence.
- Use friendly, direct language.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const customKey = req.headers.get('x-gemini-key');
    const finalKey = customKey || process.env.GEMINI_API_KEY;

    if (!finalKey || finalKey.trim() === '') {
      return NextResponse.json({ role: 'assistant', content: "يرجى ضبط مفتاح API أولاً." });
    }

    // Reverting to the most stable IDs possible
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b"
    ];

    const contents = messages.map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text || "" }]
    }));
    if (contents.length > 0 && contents[0].role === "model") contents.shift();

    // Direct Instruction Injection
    const languageInstruction = " (Respond in the same language as the user. Stay brief.)";
    if (contents.length > 0) {
        contents[0].parts[0].text = `PetZone System: ${SYSTEM_PROMPT}\n\nUser Question: ${contents[0].parts[0].text}${languageInstruction}`;
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
        } else {
           console.error("Gemini Error:", data);
           // If error is about API KEY, we show it
           if (data.error?.message?.includes("API key")) {
              return NextResponse.json({ role: 'assistant', content: "خطأ في مفتاح API الخاص بجوجل." });
           }
        }
      } catch (err) {
        console.warn(`Fallback: ${modelId} failed`);
      }
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: "عذراً، لا يمكن الاتصال بمحرك الذكاء الاصطناعي حالياً. يرجى مراجعة مفتاح API." 
    });

  } catch (error) {
    return NextResponse.json({ role: 'assistant', content: 'تحذير: حدث خطأ غير متوقع في الاتصال.' });
  }
}
