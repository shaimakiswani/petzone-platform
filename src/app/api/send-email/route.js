import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp, userName } = await req.json();

    // IMPORTANT: Replace 're_123456789' with your real Resend API Key
    // You can get it for free from https://resend.com
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY environment variable");
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PetZone <onboarding@resend.dev>",
        to: [email],
        subject: `Your Verification Code: ${otp} 🐾`,
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 40px; border: 2px solid #ec4899; border-radius: 30px; max-width: 500px; margin: 20px auto;">
            <h1 style="color: #ec4899; margin-bottom: 10px;">PetZone</h1>
            <p style="color: #666; font-size: 16px;">Use the code below to verify your account:</p>
            <div style="background: #fdf2f8; padding: 30px; border-radius: 20px; margin: 30px 0;">
              <span style="letter-spacing: 15px; font-size: 40px; font-weight: 900; color: #db2777; display: block; width: 100%;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code is valid for 10 minutes.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, id: data.id });
    } else {
      console.error("Resend Error:", data);
      return NextResponse.json({ success: false, error: data.message }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
