"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = require("next/navigation").useRouter();
  const pathname = require("next/navigation").usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            
            // 1. Check for Banned Status
            if (profileData.role === "banned") {
                signOut(auth);
                setUser(null);
                alert("Access Denied: This account has been banned.");
                return;
            }

            const updatedUser = { ...currentUser, ...profileData };
            setUser(updatedUser);

            // 2. Block Unverified Users (New Logic)
            // Skip check for auth-related pages to avoid loops
            const publicPages = ["/login", "/register", "/verify"];
            const isPublicPage = publicPages.some(page => pathname?.startsWith(page));

            if (profileData.password_enc && !profileData.isVerified && !isPublicPage) {
              router.push(`/verify?email=${currentUser.email}`);
            }
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pathname, router]);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
