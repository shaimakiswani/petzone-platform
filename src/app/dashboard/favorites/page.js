"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function FavoritesPage() {
  const { favorites, loading: favLoading } = useFavorites();
  const { user, loading: authLoading } = useAuth();
  const { t, isAr } = useLanguage();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function fetchFavoritedItems() {
      if (favorites.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const [petsSnap, suppliesSnap, clinicsSnap, hostelsSnap] = await Promise.all([
          getDocs(collection(db, "pets")),
          getDocs(collection(db, "supplies")),
          getDocs(collection(db, "clinics")),
          getDocs(collection(db, "hostels"))
        ]);

        const allItems = [
          ...petsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), listingType: 'pets' })),
          ...suppliesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), listingType: 'supplies' })),
          ...clinicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), listingType: 'clinics' })),
          ...hostelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), listingType: 'hostels' }))
        ];

        const favItems = allItems.filter(item => favorites.includes(item.id));
        setItems(favItems);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (!favLoading && user) {
      fetchFavoritedItems();
    }
  }, [favorites, favLoading, user, authLoading, router]);

  if (authLoading || favLoading || loading) {
    return <div className="text-center py-20 text-gray-500">{t('favorites.loading')}</div>;
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2">{t('favorites.title')} ({items.length})</h1>
        <p className="text-gray-500">{t('favorites.desc')}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
          <span className="text-7xl block mb-6 animate-pulse">❤️</span>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('favorites.empty')}</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{t('favorites.empty_desc')}</p>
          <button 
            onClick={() => router.push('/pets')} 
            className="bg-brand-500 text-white font-black px-8 py-3 rounded-2xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
          >
            {t('favorites.btn_explore')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map(item => (
            <ListingCard key={item.id} item={item} type={item.listingType || "pets"} />
          ))}
        </div>
      )}
    </div>
  );
}
