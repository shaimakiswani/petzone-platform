"use client";

import { useEffect, useState, useMemo } from "react";
import ListingCard from "@/components/ListingCard";
import { Search } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { PET_DATA } from "@/constants/petData";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = ["All", ...Object.keys(PET_DATA)];

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { t, isAr } = useLanguage();

  const categoryMap = {
    "All": "all",
    "Dog": "dog",
    "Cat": "cat",
    "Bird": "bird",
    "Fish": "fish",
    "Rabbit": "rabbit",
    "Rodent": "rodent",
    "Reptile": "reptile",
    "Livestock": "livestock",
    "Other": "other"
  };

  useEffect(() => {
    async function fetchPets() {
      try {
        const q = query(collection(db, "pets"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const petsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, []);

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      // Category match (Dog, Cat, etc.)
      const matchesCategory = selectedCategory === "All" || 
        (pet.type && pet.type.toLowerCase() === selectedCategory.toLowerCase());
      
      // Search match (name, breed, location)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = pet.name.toLowerCase().includes(searchLower) ||
                            pet.breed.toLowerCase().includes(searchLower) ||
                            pet.location.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [pets, selectedCategory, searchTerm]);

  return (
    <div className={isAr ? 'rtl' : 'ltr'}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('pets_page.title')}</h1>
          <p className="text-gray-500">{t('pets_page.desc')}</p>
        </div>
        <div className={`flex gap-2 w-full md:w-auto ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1 md:w-64">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('pets_page.search_placeholder')}
              className={`w-full ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-100`}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              selectedCategory === cat 
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
          >
            {t(`categories.${categoryMap[cat] || 'other'}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">{t('pets_page.loading_pets')}</div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 mb-6">
             <Search size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{t('pets_page.no_pets')}</h2>
          <p className="text-gray-500 font-medium">{t('pets_page.no_pets_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <ListingCard key={pet.id} item={pet} type="pets" />
          ))}
        </div>
      )}
    </div>
  );
}
