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
        subject: "Verify your PetZone account 🐾",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <h2 style="color: #ec4899; text-align: center;">Welcome to PetZone!</h2>
            <p>Hi ${userName || "there"},</p>
            <p>Thank you for joining our community. Please use the following code to verify your account:</p>
            <div style="background: #fdf2f8; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
              <h1 style="letter-spacing: 10px; font-size: 32px; margin: 0; color: #db2777;">${otp}</h1>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">This code will expire soon. If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 10px; color: #999; text-align: center;">&copy; 2026 PetZone Platform. All rights reserved.</p>
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
