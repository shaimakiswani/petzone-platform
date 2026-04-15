"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import ListingCard from "@/components/ListingCard";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchClinics() {
      try {
        const q = query(collection(db, "clinics"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClinics(data);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClinics();
  }, []);

  const filteredItems = useMemo(() => {
    return clinics.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return item.name?.toLowerCase().includes(searchLower) ||
             item.location?.toLowerCase().includes(searchLower);
    });
  }, [clinics, searchTerm]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verified Vets & Clinics</h1>
          <p className="text-gray-500">Find trusted healthcare professionals for your furry friends.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or city..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading clinics...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No clinics found</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(clinic => (
            <ListingCard key={clinic.id} item={clinic} type="clinics" />
          ))}
        </div>
      )}
    </div>
  );
}
