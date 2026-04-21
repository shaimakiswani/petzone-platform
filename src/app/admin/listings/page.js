"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink,
  MapPin,
  Tag
} from "lucide-react";
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc, writeBatch, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";

export default function ListingsModeration() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCollection, setCurrentCollection] = useState("pets");

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const q = query(collection(db, currentCollection), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setListings(snapshot.docs.map(doc => ({ id: doc.id, collection: currentCollection, ...doc.data() })));
      } catch (err) {
        console.error("Fetch Listings Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [currentCollection]);

  const sendNotification = async (userId, listingName, type) => {
    if (!userId) return; // Fallback if listing has no owner ID
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "moderation",
        message: `Your listing "${listingName}" was ${type} by an administrator for violating platform community rules.`,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Notify error:", err);
    }
  };

  const handleToggleVisibility = async (listingId, currentStatus, ownerId, listingName) => {
    try {
      const newStatus = currentStatus === "hidden" ? "public" : "hidden";
      await updateDoc(doc(db, currentCollection, listingId), { status: newStatus });
      if (newStatus === "hidden") {
        await sendNotification(ownerId, listingName, "hidden");
      }
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
      alert(`Listing ${newStatus === 'hidden' ? 'hidden and user notified' : 'made public'}.`);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDeleteListing = async (listingId, ownerId, listingName) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this listing?")) return;
    try {
      await deleteDoc(doc(db, currentCollection, listingId));
      await sendNotification(ownerId, listingName, "permanently removed");
      setListings(prev => prev.filter(l => l.id !== listingId));
      alert("Listing deleted and user notified.");
    } catch (err) {
      alert("Failed to delete listing");
    }
  };

  const filteredListings = listings.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pets: listings.filter(l => l.collection === 'pets').length,
    supplies: listings.filter(l => l.collection === 'supplies').length,
    clinics: listings.filter(l => l.collection === 'clinics').length,
    hostels: listings.filter(l => l.collection === 'hostels').length,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="text-brand-500" /> Listings Moderation
          </h1>
          <p className="text-gray-500 mt-1">Review, hide, or remove marketplace content.</p>
        </div>
      </header>

      {/* Collection Switcher */}
      <div className="flex flex-wrap gap-2">
        {['pets', 'supplies', 'clinics', 'hostels'].map(c => (
          <button
            key={c}
            onClick={() => setCurrentCollection(c)}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              currentCollection === c 
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" 
                : "bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800 hover:border-brand-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder={`Search ${currentCollection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/10 focus:border-brand-300 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Listing</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-8 bg-gray-50/30"></td>
                  </tr>
                ))
              ) : filteredListings.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium font-bold">No {currentCollection} listings found.</td>
                </tr>
              ) : filteredListings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <img src={l.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-110" />
                        {l.status === 'hidden' && (
                          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                            <EyeOff size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[200px] lg:max-w-xs">
                        <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{l.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Tag size={10} /> {l.type || l.category || 'General'} Listing
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                      l.status === 'hidden' 
                        ? 'bg-rose-100 text-rose-600 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {l.status === 'hidden' ? "Hidden" : "Public"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                      <MapPin size={12} className="text-brand-300" /> {l.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleVisibility(l.id, l.status, l.userId, l.name)}
                        title={l.status === 'hidden' ? "Make Public" : "Hide Listing"}
                        className={`p-2 rounded-xl transition-all border ${
                          l.status === 'hidden' 
                            ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-100' 
                            : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-100'
                        } shadow-sm`}
                      >
                        {l.status === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      
                      <Link 
                        href={`/${currentCollection}/${l.id}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-brand-500 hover:text-white border border-gray-100 transition-all shadow-sm"
                      >
                        <ExternalLink size={16} />
                      </Link>

                      <button 
                        onClick={() => handleDeleteListing(l.id, l.userId, l.name)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white border border-slate-200 transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
