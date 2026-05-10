"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff } from "lucide-react";

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [step, setStep] = useState(1); // 1: OTP, 2: New Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setStep(2);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Password Changed! 🎉</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <button 
          onClick={() => router.push("/login")}
          className="mt-8 bg-brand-500 text-white font-bold px-12 py-3 rounded-xl hover:bg-brand-600 transition shadow-lg"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-brand-50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">
            {step === 1 ? "Verify Code" : "New Password"}
          </h2>
          <p className="text-gray-500 mt-2 text-center text-sm">
            {step === 1 
              ? `Enter the 6-digit code sent to ${email}`
              : "Create a new strong password for your account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm text-center flex items-center justify-center gap-2 border border-red-100">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-4xl tracking-[1rem] font-black py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-400 focus:bg-white transition-all"
              placeholder="000000"
            />
            <button
              disabled={otp.length < 6}
              type="submit"
              className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-70 transition active:scale-95"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="New Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Confirm Password"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-70 transition"
            >
              {loading ? "Updating..." : "Update Password & Login"}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push("/login")}
            className="text-gray-400 text-xs hover:text-brand-500 transition underline"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <ResetContent />
    </Suspense>
  );
}
