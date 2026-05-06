"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Package, 
  AlertTriangle, 
  Activity, 
  Stethoscope, 
  Home,
  TrendingUp,
  Clock
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    supplies: 0,
    clinics: 0,
    hostels: 0,
    reports: 0
  });
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          usersSnap, 
          petsSnap, 
          suppliesSnap, 
          clinicsSnap, 
          hostelsSnap,
          reportsSnap
        ] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "pets")),
          getCountFromServer(collection(db, "supplies")),
          getCountFromServer(collection(db, "clinics")),
          getCountFromServer(collection(db, "hostels")),
          getCountFromServer(collection(db, "reports"))
        ]);

        setStats({
          users: usersSnap.data().count,
          pets: petsSnap.data().count,
          supplies: suppliesSnap.data().count,
          clinics: clinicsSnap.data().count,
          hostels: hostelsSnap.data().count,
          reports: reportsSnap.data().count
        });

        // Fetch 5 most recent listings across everything? 
        // For simplicity, let's just show recent pets for now
        const recentSnap = await getDocs(query(collection(db, "pets"), orderBy("createdAt", "desc"), limit(5)));
        setRecentListings(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Users", value: stats.users, icon: Users, color: "bg-blue-500", text: "text-blue-500", href: "/admin/users" },
    { name: "Pet Listings", value: stats.pets, icon: Package, color: "bg-brand-500", text: "text-brand-500", href: "/admin/listings" },
    { name: "Pending Reports", value: stats.reports, icon: AlertTriangle, color: "bg-red-500", text: "text-red-500", href: "/admin/reports" },
    { name: "Health Services", value: stats.clinics + stats.hostels, icon: Stethoscope, color: "bg-emerald-500", text: "text-emerald-500", href: "/admin/services" },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Real-time statistics for PetZone marketplace.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.name} href={card.href} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group block">
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.color} p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp size={12} /> +2.5%
              </span>
            </div>
            <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1 group-hover:text-brand-500 transition-colors">{card.name}</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{card.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="text-brand-500" /> Recent Listings
              </h2>
              <Link href="/admin/listings" className="text-sm font-bold text-brand-500 hover:underline">View All</Link>
           </div>
           
           <div className="space-y-4">
              {recentListings.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10">No recent activity found.</p>
              ) : recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-800 group hover:border-brand-100 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={listing.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{listing.name}</h4>
                      <p className="text-[10px] text-gray-400 capitalize">{listing.type} • {listing.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand-500">${listing.price}</p>
                    <p className="text-[10px] text-gray-400">Listed 2h ago</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
