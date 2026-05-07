"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { doc, setDoc, query, collection, where, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Verification States
  const [step, setStep] = useState("register"); // register, verify
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [tempUserId, setTempUserId] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  // Simple encryption simulation for display in DB (Base64 + Salt)
  const encryptPassword = (pass) => {
    return btoa("petzone_" + pass + "_secured");
  };

  const validatePassword = (pass) => {
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return hasNumber && hasLetter && isLongEnough;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      
      // Password Strength Check
      if (!validatePassword(password)) {
        setError("Password must be at least 8 characters long and contain both letters and numbers.");
        return;
      }

      setLoading(true);

      // Unique Name Check (Case-insensitive)
      const usersRef = collection(db, "users");
      const normalizedName = name.trim().toLowerCase();
      
      const q = query(usersRef, where("name_lowercase", "==", normalizedName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError("This name is already taken. Please choose another Full Name.");
        setLoading(false);
        return;
      }

      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      const userCredential = await register(email, password);
      const uid = userCredential.user.uid;
      setTempUserId(uid);
      
      // Initialize basic user profile in Firestore
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        name: name.trim(),
        name_lowercase: normalizedName,
        email: email,
        role: "user",
        password_enc: encryptPassword(password), // Stored as requested
        verificationCode: code,
        isVerified: false,
        createdAt: new Date().toISOString()
      });

      // Simulation: Show code to user since no real email sender is connected
      alert(`DEBUG: Your verification code is: ${code}\n(In production, this will be sent to your email)`);
      
      setStep("verify");
    } catch (err) {
      console.error(err);
      const code = err.code || "unknown";
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Your password is too weak!");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp === generatedOtp) {
      try {
        await updateDoc(doc(db, "users", tempUserId), {
          isVerified: true,
          verificationCode: null
        });
        setStep("success");
      } catch (err) {
        setError("Failed to verify. Please try again.");
      }
    } else {
      setError("Invalid verification code. Please check and try again.");
    }
    setLoading(false);
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Account Ready! 🎉</h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Your account has been successfully verified. You can now log in and start using PetZone.
        </p>
        <button 
          onClick={() => router.push("/login")}
          className="mt-8 bg-brand-500 text-white font-bold px-12 py-3 rounded-xl hover:bg-brand-600 transition shadow-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-brand-50">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Verify Email</h2>
            <p className="text-gray-500 mt-2 text-center">We've sent a 6-digit code to <br/><span className="font-bold text-gray-900">{email}</span></p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter Verification Code</label>
              <input
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-3xl tracking-[1rem] font-black py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                placeholder="000000"
              />
            </div>
            <button
              disabled={loading || otp.length < 6}
              type="submit"
              className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/30 disabled:opacity-70 transition"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
          
          <p className="mt-6 text-center text-xs text-gray-400">
            Didn't receive the code? Check your spam folder or <button className="text-brand-600 font-bold">Resend</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-brand-100/50 border border-brand-50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
            <PawPrint className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join the PetZone community today</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                placeholder="John Doe"
              />
            </div>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            <p className="text-[10px] text-gray-400 mt-2 px-1">
              * Must be at least 8 characters with letters and numbers.
            </p>
          </div>
          
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/30 disabled:opacity-70 mt-6"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
