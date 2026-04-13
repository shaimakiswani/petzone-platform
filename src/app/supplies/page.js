"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import ListingCard from "@/components/ListingCard";

const CATEGORIES = ["All", "Food", "Toys", "Accessories", "Medical"];

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    async function fetchSupplies() {
      try {
        const q = query(collection(db, "supplies"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSupplies(data);
      } catch (error) {
        console.error("Error fetching supplies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSupplies();
  }, []);

  const filteredItems = useMemo(() => {
    return supplies.filter(item => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = item.name?.toLowerCase().includes(searchLower) ||
                            item.description?.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [supplies, selectedCategory, searchTerm]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Supplies</h1>
          <p className="text-gray-500">Everything your pet needs, from food to toys.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supplies..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
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
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading supplies...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No items found</h2>
          <p className="text-gray-500">Try adjusting your filters or be the first to sell!</p>
          <Link href="/dashboard/add" className="inline-block mt-4 text-brand-500 font-bold hover:underline">
            + Sell an Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ListingCard key={item.id} item={item} type="supplies" />
          ))}
        </div>
      )}
    </div>
  );
}
