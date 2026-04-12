"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorites from Firestore when user logs in
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().favorites) {
          setFavorites(docSnap.data().favorites);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadFavorites();
  }, [user]);

  const toggleFavorite = async (itemId) => {
    if (!user) {
      alert("Please login to add to favorites!");
      return;
    }

    const docRef = doc(db, "users", user.uid);
    const isFav = favorites.includes(itemId);

    try {
      if (isFav) {
        await setDoc(docRef, { favorites: arrayRemove(itemId) }, { merge: true });
        setFavorites(prev => prev.filter(id => id !== itemId));
      } else {
        await setDoc(docRef, { favorites: arrayUnion(itemId) }, { merge: true });
        setFavorites(prev => [...prev, itemId]);
      }
    } catch (err) {
      console.error("Error updating favorites", err);
    }
  };

  const isFavorite = (itemId) => favorites.includes(itemId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
