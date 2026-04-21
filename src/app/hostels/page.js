"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import ListingCard from "@/components/ListingCard";
import { useLanguage } from "@/context/LanguageContext";

export default function HostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { t, isAr } = useLanguage();

  useEffect(() => {
    async function fetchHostels() {
      try {
        const q = query(collection(db, "hostels"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHostels(data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHostels();
  }, []);

  const filteredItems = useMemo(() => {
    return hostels.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = item.name?.toLowerCase().includes(searchLower) ||
                            item.location?.toLowerCase().includes(searchLower);
      
      const itemCategory = item.category || "hostel";
      const matchesCategory = selectedCategory === "All" || itemCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [hostels, searchTerm, selectedCategory]);

  const CATEGORIES = [
    { value: "All", label: t('categories.all') },
    { value: "hostel", label: t('categories.hostel') },
    { value: "sitter", label: t('categories.sitter') },
  ];

  return (
    <div className={isAr ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hostels_page.title')}</h1>
          <p className="text-gray-500">{t('hostels_page.desc')}</p>
        </div>
        <div className={`flex gap-2 w-full md:w-auto ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1 md:w-64">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('hostels_page.placeholder')}
              className={`w-full ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all text-sm`}
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value 
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-32 text-gray-400 animate-pulse font-medium">{t('common.loading')}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('hostels_page.no_results')}</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map(hostel => (
            <ListingCard key={hostel.id} item={hostel} type="hostels" />
          ))}
        </div>
      )}
    </div>
  );
}
