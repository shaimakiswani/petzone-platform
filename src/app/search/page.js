"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import PetCard from "@/components/PetCard";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import ListingCard from "@/components/ListingCard";

function SearchContent() {
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



  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Platform Search</h1>
        {q ? (
          <p className="text-gray-500 font-medium">Found {totalResults} matches for &quot;{q}&quot;</p>
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
              <p className="text-gray-500 text-xl font-medium">We couldn&apos;t find anything matching your search.</p>
              <p className="text-gray-400 text-sm mt-1">Try searching for &quot;Amman&quot;, &quot;Cat&quot;, or &quot;Vaccination&quot;.</p>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {results.pets.map(item => <ListingCard key={item.id} item={item} type="pets" />)}
            {results.supplies.map(item => <ListingCard key={item.id} item={item} type="supplies" />)}
            {results.clinics.map(item => <ListingCard key={item.id} item={item} type="clinics" />)}
            {results.hostels.map(item => <ListingCard key={item.id} item={item} type="hostels" />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
