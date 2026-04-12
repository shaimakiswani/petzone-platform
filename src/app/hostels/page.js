"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function HostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      return item.name?.toLowerCase().includes(searchLower) ||
             item.location?.toLowerCase().includes(searchLower);
    });
  }, [hostels, searchTerm]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Hostels & Sitters</h1>
          <p className="text-gray-500">Safe, comfortable places for your pet while you are away.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading hostels...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No hostels found</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(hostel => (
             <div key={hostel.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition flex flex-col md:flex-row gap-6 items-center">
               <div className="w-full md:w-32 h-32 bg-purple-50 rounded-2xl flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                 {hostel.image ? <img src={hostel.image} alt={hostel.name} className="w-full h-full object-cover" /> : "🏡"}
               </div>
               <div className="w-full">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="text-2xl font-bold text-gray-900">{hostel.name}</h3>
                   <span className="font-bold text-lg text-purple-600">${hostel.price}/night</span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                   <MapPin size={16} />
                   <span>{hostel.location}</span>
                 </div>

                 <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1 text-sm text-gray-600">
                     <CheckCircle2 size={16} className="text-green-500" />
                     Verified
                   </div>
                   <Link href={`/hostels/${hostel.id}`} className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold py-2 rounded-xl transition text-center">
                     View Details
                   </Link>
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
