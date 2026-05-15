import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // 1. Check if user exists in Firestore (get the latest one)
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ 
        success: false, 
        error: "Server configuration error: Firebase Admin is not initialized. Please configure server environment variables." 
      }, { status: 500 });
    }
    
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef
      .where("email", "==", email.trim())
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: "No account found with this email" }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save reset code in Firestore (valid for 10 mins)
    await userDoc.ref.update({
      resetCode: otp,
      resetCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    // 3. Send email via Gmail SMTP
    const EMAIL_USER = "petzone0000@gmail.com";
    const EMAIL_PASS = "zkkt sczg nfai yijh";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const mailOptions = {
      from: `"PetZone Security" <${EMAIL_USER}>`,
      to: email,
      subject: `Password Reset Code: ${otp} 🔐`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; text-align: center; padding: 40px; background-color: #fdf2f8; border-radius: 40px; max-width: 550px; margin: 20px auto; border: 1px solid #fbcfe8;">
          <div style="background-color: white; padding: 40px; border-radius: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #ec4899; margin-bottom: 5px; font-size: 28px;">Password Reset</h1>
            <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px;">You requested to reset your password. Use the code below:</p>
            
            <div style="background: #fdf2f8; padding: 25px; border-radius: 20px; margin: 25px 0; border: 2px dashed #f472b6;">
              <span style="letter-spacing: 12px; font-size: 48px; font-weight: 900; color: #db2777; display: block; width: 100%;">${otp}</span>
            </div>
            
            <p style="color: #ef4444; font-size: 13px; font-weight: bold; margin-top: 30px;">
              Important: This code will expire in 10 minutes.
            </p>
          </div>
          <p style="color: #f472b6; font-size: 11px; margin-top: 20px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
