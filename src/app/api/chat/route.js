import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
DEVELOPER_NOTE: 
You are the PetZone Assistant. Warm, professional, and concise. 
Your purpose is ONLY to help users with the PetZone platform (Pet adoption, clinics, hostels, supplies, and account management).

STRICT RULES:
1. If the user asks about ANYTHING outside of PetZone's scope (e.g., general knowledge, geography like "Where is Jordan?", personal questions, or other services), you MUST politely refuse.
2. In Arabic, refuse with: "عذراً، أنا متخصص فقط في الإجابة على الاستفسارات المتعلقة بمنصة PetZone وخدماتها للحيوانات الأليفة."
3. In English, refuse with: "Sorry, I only specialize in answering questions related to the PetZone platform and its pet-related services."
4. Do not provide information about geography, history, general science, or other non-pet topics.
5. If the user greets you, respond warmly and ask how you can help with their pet needs.
6. Always check if the question relates to: Pets, Adoption, Clinics, Hostels, Pet Supplies, or PetZone features.
`;


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
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash-lite",
      "gemini-1.5-flash" // Safety fallback
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
