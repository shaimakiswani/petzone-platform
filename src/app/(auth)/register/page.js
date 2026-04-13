"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, Mail, Lock, User } from "lucide-react";
import { doc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
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

      const userCredential = await register(email, password);
      
      // Initialize basic user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name.trim(),
        name_lowercase: normalizedName,
        email: email,
        role: "user",
        createdAt: new Date().toISOString()
      });

      router.push("/pets");
    } catch (err) {
      console.error(err);
      const code = err.code || "unknown";
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Your password is too weak! It must be at least 6 characters.");
      } else {
        setError("Failed to create an account. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-brand-100/50 border border-brand-50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
            <PawPrint className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join PetZone</h2>
          <p className="text-gray-500 mt-2">Create an account to save pets & posts</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/30 disabled:opacity-70 mt-6"
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
