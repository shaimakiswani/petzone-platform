"use client";

import { useEffect, useState } from "react";
import { 
  Stethoscope, 
  Home, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink,
  MapPin,
  Building2
} from "lucide-react";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("clinics");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const q = query(collection(db, activeTab), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Fetch Services Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      await deleteDoc(doc(db, activeTab, id));
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredServices = services.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
             <Stethoscope className="text-brand-500" /> Services Management
          </h1>
          <p className="text-gray-500 mt-1">Manage verified Clinics and Pet Hostels.</p>
        </div>
        <Link 
          href={`/dashboard/add/${activeTab === 'clinics' ? 'clinic' : 'hostel'}`}
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-black text-sm rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
          <Plus size={20} /> Add New {activeTab === 'clinics' ? 'Clinic' : 'Hostel'}
        </Link>
      </header>

      {/* Toggle */}
      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-100 dark:border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab("clinics")}
          className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "clinics" ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Clinics
        </button>
        <button 
          onClick={() => setActiveTab("hostels")}
          className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "hostels" ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Hostels
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/10 transition-all font-medium text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-[2rem]"></div>)
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-[2.5rem]">
            No {activeTab} listings found.
          </div>
        ) : filteredServices.map((service) => (
          <div key={service.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-xl transition-all group relative border-b-4 border-b-brand-100">
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link 
                  href={`/dashboard/edit/${activeTab === 'clinics' ? 'clinic' : 'hostel'}/${service.id}`}
                  className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-gray-600 hover:text-brand-500"
                >
                  <Edit size={16} />
                </Link>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-gray-600 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
             </div>

             <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 overflow-hidden shadow-inner">
                   {service.image ? (
                     <img src={service.image} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <Building2 size={24} />
                   )}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white truncate max-w-[150px]">{service.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <MapPin size={10} className="text-brand-300" /> {service.location}
                  </div>
                </div>
             </div>

             <div className="space-y-3 pt-3 border-t border-gray-50 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-400 font-medium">Contact:</span>
                   <span className="text-gray-900 dark:text-slate-300 font-bold">{service.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-400 font-medium">Ratings:</span>
                   <span className="text-amber-500 font-black">★ 4.8</span>
                </div>
             </div>

             <Link 
               href={`/${activeTab}/${service.id}`}
               className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all shadow-inner"
             >
                <ExternalLink size={14} /> Full Profile
             </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
