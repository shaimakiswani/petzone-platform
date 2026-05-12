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

    const prompt = `You are a professional translator for PetZone. 
    Translate the following text into ${targetLang === 'ar' ? 'Arabic' : 'English'}.
    Ensure the translation is natural and high-quality for a pet marketplace.
    Only return the translated text. Do not include quotes, explanations, or any other text.

    TEXT TO TRANSLATE:
    ${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Translation failed.";
      return NextResponse.json({ translatedText: translatedText.trim() });
    } else {
      console.error("Gemini API Error details:", data);
      return NextResponse.json({ 
        error: "Gemini API error.", 
        details: data.error?.message || "Unknown error",
        status: response.status 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
