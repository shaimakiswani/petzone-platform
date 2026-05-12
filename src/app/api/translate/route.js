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

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash-lite",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    const prompt = `You are a professional translator for PetZone. 
    Translate the following text into ${targetLang === 'ar' ? 'Arabic' : 'English'}.
    Ensure the translation is natural and high-quality for a pet marketplace.
    Only return the translated text. Do not include quotes, explanations, or any other text.

    TEXT TO TRANSLATE:
    ${text}`;

    for (const modelId of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;
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
          console.warn(`Translation Fallback: ${modelId} failed:`, data.error?.message);
          // If it's the last model, return the error
          if (modelId === modelsToTry[modelsToTry.length - 1]) {
             return NextResponse.json({ 
               error: "Gemini API error.", 
               details: data.error?.message || "Unknown error",
               status: response.status 
             }, { status: 500 });
          }
        }
      } catch (err) {
        console.warn(`Translation Fallback Error for ${modelId}:`, err);
      }
    }

    return NextResponse.json({ error: "All translation models failed." }, { status: 500 });

  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
