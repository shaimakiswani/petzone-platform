"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { auth } from "@/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      setLoading(true);
      
      const userCredential = await login(email, password);
      
      // Fetch user doc to check if it's a new system account
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/firebase/config");
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      // Only enforce verification for accounts created with the new system (have password_enc)
      if (userData?.password_enc && !userData?.isVerified) {
        setError("Your account is not verified.");
        setMessage(
          <div className="mt-2">
            <p className="text-xs mb-3">Please verify your account to continue.</p>
            <button 
              onClick={() => router.push(`/verify?email=${email}`)}
              className="bg-brand-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-brand-600 transition"
            >
              Verify My Account Now
            </button>
          </div>
        );
        setLoading(false);
        return;
      }

      router.push("/pets");
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address in the field above first.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      // Call our new OTP reset API
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Redirect to the reset-password page with email in query
        router.push(`/reset-password?email=${email}`);
      } else {
        setError(data.error || "Failed to send reset code.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the reset service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-brand-100/50 border border-brand-50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
            <PawPrint className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to your PetZone account</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>}
        {message && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-6 text-sm text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/30 disabled:opacity-70 mt-4"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

