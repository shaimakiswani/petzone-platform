import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, otp, userName } = await req.json();

    // Use environment variables for security
    // EMAIL_USER: Your project gmail (e.g. petzone.project@gmail.com)
    // EMAIL_PASS: Your 16-character Gmail App Password
    // Gmail Credentials provided by user
    const EMAIL_USER = "petzone0000@gmail.com";
    const EMAIL_PASS = "zkkt sczg nfai yijh";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PetZone Platform" <${EMAIL_USER}>`,
      to: email,
      subject: `Your Verification Code: ${otp} 🐾`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px; background-color: #fdf2f8; border-radius: 40px; max-width: 550px; margin: 20px auto; border: 1px solid #fbcfe8;">
          <div style="background-color: white; padding: 40px; border-radius: 30px; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #ec4899; margin-bottom: 5px; font-size: 32px;">PetZone</h1>
            <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px;">Your furry friends are waiting! 🐾</p>
            
            <p style="color: #374151; font-size: 18px; font-weight: 500;">Use the verification code below:</p>
            
            <div style="background: #fdf2f8; padding: 25px; border-radius: 20px; margin: 25px 0; border: 2px dashed #f472b6;">
              <span style="letter-spacing: 12px; font-size: 48px; font-weight: 900; color: #db2777; display: block; width: 100%;">${otp}</span>
            </div>
            
            <p style="color: #9ca3af; font-size: 13px; margin-top: 30px;">
              This code is valid for 10 minutes. <br>
              If you didn't request this, please ignore this email.
            </p>
          </div>
          <p style="color: #f472b6; font-size: 11px; margin-top: 20px; font-weight: bold;">
            &copy; 2026 PetZone Platform | Built with Love for Pets
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully via Gmail");
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Gmail SMTP Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to send email via Gmail" 
    }, { status: 500 });
  }
}
