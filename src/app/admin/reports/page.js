"use client";

import { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserPlus,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";

export default function ReportsModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Fetch Reports Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const sendNotification = async (userId, listingName, type) => {
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

  const handleAction = async (reportId, action, listingId, collectionType, ownerId, listingName) => {
    try {
      if (action === "ignore") {
        await deleteDoc(doc(db, "reports", reportId));
        setReports(prev => prev.filter(r => r.id !== reportId));
      } else if (action === "hide") {
        await updateDoc(doc(db, collectionType, listingId), { status: "hidden" });
        await sendNotification(ownerId, listingName, "hidden");
        await deleteDoc(doc(db, "reports", reportId));
        setReports(prev => prev.filter(r => r.id !== reportId));
        alert("Listing hidden and user notified.");
      } else if (action === "delete") {
        if (!confirm("Are you sure? This will delete the listing permanently.")) return;
        await deleteDoc(doc(db, collectionType, listingId));
        await sendNotification(ownerId, listingName, "permanently removed");
        await deleteDoc(doc(db, "reports", reportId));
        setReports(prev => prev.filter(r => r.id !== reportId));
        alert("Listing deleted and user notified.");
      }
    } catch (err) {
      alert("Failed to perform action");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <AlertTriangle className="text-red-500" /> Reports Moderation
        </h1>
        <p className="text-gray-500 mt-1">Investigate and take action on flagged content.</p>
      </header>

      {loading ? (
        <div className="text-center py-32 text-gray-400 font-bold animate-pulse">Loading reports queue...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] py-24 text-center">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
             🛡️
           </div>
           <h2 className="text-2xl font-black text-gray-800 dark:text-white">Clean Queue!</h2>
           <p className="text-gray-500 mt-2">No listings have been reported recently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 hover:shadow-xl transition-all border-l-4 border-l-red-500 shadow-sm relative group">
               <div className="shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-gray-100 overflow-hidden relative">
                    <img src={report.listingImage} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg shadow-lg">
                       <AlertTriangle size={14} />
                    </div>
                  </div>
               </div>

               <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{report.listingName}</h3>
                      <p className="text-sm font-bold text-red-500 flex items-center gap-2">
                        Reason: <span className="text-gray-600 dark:text-slate-400 font-medium italic">"{report.reason}"</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reported By</span>
                       <p className="text-xs font-bold text-gray-600 dark:text-slate-300">{report.userName}</p>
                       <p className="text-[10px] text-gray-400 italic">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <button 
                      onClick={() => handleAction(report.id, 'ignore', report.listingId, report.listingCollection)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-black text-xs rounded-xl hover:bg-gray-100 border border-gray-100 dark:border-slate-700 transition-all active:scale-95"
                    >
                      <XCircle size={16} /> Ignore Report
                    </button>
                    <button 
                      onClick={() => handleAction(report.id, 'hide', report.listingId, report.listingCollection, report.ownerId, report.listingName)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 font-black text-xs rounded-xl hover:bg-amber-600 hover:text-white border border-amber-100 transition-all active:scale-95"
                    >
                      <ArrowRight size={16} /> Hide From Public
                    </button>
                    <button 
                      onClick={() => handleAction(report.id, 'delete', report.listingId, report.listingCollection, report.ownerId, report.listingName)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-black text-xs rounded-xl hover:bg-red-600 hover:text-white border border-red-100 transition-all active:scale-95"
                    >
                      <Trash2 size={16} /> Delete Listing
                    </button>
                    
                    <Link 
                      href={`/${report.listingCollection}/${report.listingId}`}
                      target="_blank"
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-50 text-brand-600 font-black text-xs rounded-xl hover:bg-brand-500 hover:text-white border border-brand-100 transition-all ml-auto active:scale-95"
                    >
                      <ExternalLink size={16} /> View Listing
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
