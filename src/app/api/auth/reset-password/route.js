import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Find user in Firestore (get the latest one)
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef
      .where("email", "==", email.trim())
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 2. Verify OTP and Expiration
    if (userData.resetCode !== otp) {
      return NextResponse.json({ success: false, error: "Invalid reset code" }, { status: 400 });
    }

    if (new Date() > userData.resetCodeExpires.toDate()) {
      return NextResponse.json({ success: false, error: "Code expired. Please request a new one." }, { status: 400 });
    }

    // 3. Update password in Firebase Auth
    await adminAuth.updateUser(userData.uid, {
      password: newPassword
    });

    // 4. Update password_enc in Firestore (for compatibility with your encryption system if needed)
    // Here we just clear the reset code
    await userDoc.ref.update({
      resetCode: null,
      resetCodeExpires: null
    });

    return NextResponse.json({ success: true, message: "Password updated successfully!" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
