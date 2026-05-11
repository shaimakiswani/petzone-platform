import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, targetLang } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Translation service not configured." }, { status: 500 });
    }

    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const prompt = `Translate the following pet-related description into ${targetLang === 'ar' ? 'Arabic' : 'English'}. 
    Only provide the translated text without any explanations or extra characters.
    
    Text to translate: "${text}"`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Translation failed.";
      return NextResponse.json({ translatedText: translatedText.trim() });
    } else {
      return NextResponse.json({ error: "Gemini API error." }, { status: 500 });
    }

  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
