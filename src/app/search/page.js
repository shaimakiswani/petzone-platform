"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import PetCard from "@/components/PetCard";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [results, setResults] = useState({ pets: [], clinics: [], hostels: [], supplies: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      if (!q.trim()) {
        setResults({ pets: [], clinics: [], hostels: [], supplies: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const queryTerm = q.toLowerCase();
        
        // Fetch everything (since we don't have a giant database, client-side global filtering is very fast)
        const [petsSnap, clinicsSnap, hostelsSnap, suppliesSnap] = await Promise.all([
          getDocs(collection(db, "pets")),
          getDocs(collection(db, "clinics")),
          getDocs(collection(db, "hostels")),
          getDocs(collection(db, "supplies"))
        ]);

        const keywordMap = {
          // Types
          "كلب": "dog", "كلاب": "dog", "صلوقي": "dog", "جرو": "dog", "جراء": "dog",
          "قطة": "cat", "قطط": "cat", "بسة": "cat", "بسي": "cat", "هر": "cat", "هررة": "cat",
          "عصفور": "bird", "طيور": "bird", "بلبل": "bird",
          "حيوان": "animal", "حيوانات": "animal",
          // Genders
          "ذكر": "male", "فحل": "male",
          "أنثى": "female", "نتاية": "female", "انثى": "female",
          // Categories
          "عيادة": "clinic", "دكتور": "clinic", "مستشفى": "clinic", "عيادات": "clinic",
          "فندق": "hostel", "استضافة": "hostel", "شاليه": "hostel", "فنادق": "hostel",
          "محل": "supply", "اكل": "supply", "طعام": "supply", "لعبة": "supply", "مستلزمات": "supply", "اغراض": "supply",
          // Breeds (Common)
          "شيرازي": "persian", "سيامي": "siamese", "همالايا": "himalayan",
          "هاسكي": "husky", "جولدن": "golden retriever", "جيرمن": "germany", "بولدوج": "bulldog",
          "بيت بول": "pitbull", "بوكسر": "boxer", "بيجل": "beagle", "دوبرمان": "doberman",
          // General
          "مجاني": "0", "تبني": "0", "هدية": "0", "للتنبي": "0",
          "عمان": "amman", "اربد": "irbid", "الزرقاء": "zarqa", "العقبة": "aqaba",
          "ذكر": "male", "أنثى": "female", "انثى": "female"
        };

        const filterDocs = (snap, type) => snap.docs
          .map(doc => ({ id: doc.id, ...doc.data(), type }))
          .filter(item => {
            const itemData = [
              item.name, 
              item.breed, 
              item.description, 
              item.category, 
              item.location,
              item.type,
              item.gender,
              item.price === 0 ? "free مجاني تبني" : item.price?.toString()
            ].filter(Boolean).map(s => s.toLowerCase());

            const searchStr = itemData.join(" ");
            
            // Check if query is in searchStr
            if (searchStr.includes(queryTerm)) return true;
            
            // Core logic: If user wrote Arabic "كلب", check if it maps to "dog" which is in our searchStr
            for (const [ar, en] of Object.entries(keywordMap)) {
               if (queryTerm.includes(ar) && searchStr.includes(en)) return true;
               if (queryTerm.includes(en) && searchStr.includes(ar)) return true;
            }

            return false;
          });

        setResults({
          pets: filterDocs(petsSnap, 'pets'),
          clinics: filterDocs(clinicsSnap, 'clinics'),
          hostels: filterDocs(hostelsSnap, 'hostels'),
          supplies: filterDocs(suppliesSnap, 'supplies')
        });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    
    performSearch();
  }, [q]);

  const totalResults = results.pets.length + results.clinics.length + results.hostels.length + results.supplies.length;

  const SearchCard = ({ item }) => (
    <Link 
      href={`/${item.type}/${item.id}`} 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full group"
    >
      <div className="h-40 bg-gray-50 flex items-center justify-center relative">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <span className="text-4xl opacity-50">
            {item.type === 'pets' ? '🐾' : item.type === 'clinics' ? '🏥' : item.type === 'hostels' ? '🏡' : '🛍️'}
          </span>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 shadow-sm uppercase tracking-tighter">
          {item.type}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 group-hover:text-brand-500 transition line-clamp-1">{item.name}</h3>
        {item.price !== undefined && (
          <p className="text-brand-500 font-black text-lg">
            ${item.price}{item.type === 'hostels' ? '/night' : ''}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          📍 {item.location || 'PetZone Platform'}
        </p>
        <p className="text-[11px] text-gray-500 line-clamp-2 mt-3 flex-1">{item.description}</p>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Platform Search</h1>
        {q ? (
          <p className="text-gray-500 font-medium">Found {totalResults} matches for "{q}"</p>
        ) : (
          <p className="text-gray-500">Discover everything for your pet</p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Scanning the database...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {totalResults === 0 && q && (
            <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
              <span className="text-7xl block mb-6 animate-bounce">🕵️‍♂️</span>
              <p className="text-gray-500 text-xl font-medium">We couldn't find anything matching your search.</p>
              <p className="text-gray-400 text-sm mt-1">Try searching for "Amman", "Cat", or "Vaccination".</p>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.pets.map(item => <SearchCard key={item.id} item={item} />)}
            {results.supplies.map(item => <SearchCard key={item.id} item={item} />)}
            {results.clinics.map(item => <SearchCard key={item.id} item={item} />)}
            {results.hostels.map(item => <SearchCard key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}
