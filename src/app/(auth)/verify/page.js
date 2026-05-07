"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);
    setError("");

    try {
      // Find the pending user in Firestore
      const q = query(collection(db, "users"), where("email", "==", email), where("isVerified", "==", false));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Account not found or already verified.");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.verificationCode === otp) {
        // Success! Update status
        await updateDoc(doc(db, "users", userDoc.id), {
          isVerified: true,
          verificationCode: null
        });
        setSuccess(true);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await updateDoc(doc(db, "users", querySnapshot.docs[0].id), {
          verificationCode: newCode
        });
        
        // Send Real Email via API
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: newCode, userName: querySnapshot.docs[0].data().name }),
        });
      }
    } catch (err) {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Verified! 🎉</h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Your account is now active. You can start using PetZone and exploring our services.
        </p>
        <button 
          onClick={() => router.push("/login")}
          className="mt-8 bg-brand-500 text-white font-bold px-12 py-3 rounded-xl hover:bg-brand-600 transition shadow-lg"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-brand-50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Security Check</h2>
          <p className="text-gray-500 mt-2 text-center text-sm">
            Please enter the 6-digit code sent to:<br/>
            <span className="font-bold text-gray-900">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm text-center flex items-center justify-center gap-2 border border-red-100">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-4xl tracking-[1rem] font-black py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-400 focus:bg-white transition-all"
              placeholder="000000"
            />
          </div>
          
          <button
            disabled={loading || otp.length < 6}
            type="submit"
            className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/30 disabled:opacity-70 transition active:scale-95"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">Didn't receive the code?</p>
          <button 
            disabled={resending}
            onClick={handleResend}
            className="flex items-center gap-2 mx-auto text-brand-600 font-bold hover:text-brand-700 transition"
          >
            {resending ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Resend Verification Code
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
