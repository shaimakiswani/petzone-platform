"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(clinic => (
             <div key={clinic.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition">
               {clinic.image ? (
                 <img src={clinic.image} alt={clinic.name} className="w-full h-40 object-cover rounded-2xl mb-4" />
               ) : (
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 text-2xl">🏥</div>
               )}
               <h3 className="text-xl font-bold text-gray-900 mb-1">{clinic.name}</h3>
               <div className="flex items-center text-sm text-yellow-500 font-bold mb-3">
                 <Star size={16} className="fill-current mr-1" />
                 {clinic.rating || "4.8"} (Reviews)
               </div>
               <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                 <MapPin size={16} className="mt-0.5 shrink-0" />
                 <p>{clinic.location}</p>
               </div>
               <Link href={`/clinics/${clinic.id}`} className="mt-6 w-full block text-center bg-blue-50 text-blue-600 font-bold py-2 rounded-xl hover:bg-blue-100 transition">
                View Details
              </Link>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
