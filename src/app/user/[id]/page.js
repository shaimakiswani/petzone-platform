"use client";

import { useEffect, useState, use } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc
} from "firebase/firestore";
import { db } from "@/firebase/config";
import ListingCard from "@/components/ListingCard";
import { User, Package, Calendar, Star, ShieldCheck, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PublicProfilePage({ params }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams.id;
  const { t, isAr } = useLanguage();
  
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ total: 0, sold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchSellerData() {
      try {
        const sellerDoc = await getDoc(doc(db, "users", userId));
        if (sellerDoc.exists()) {
          setSeller(sellerDoc.data());
        }

        const collections = ["pets", "supplies", "clinics", "hostels"];
        let allListings = [];
        let soldCount = 0;

        await Promise.all(collections.map(async (col) => {
          const q = query(collection(db, col), where("userId", "==", userId));
          const snap = await getDocs(q);
          snap.docs.forEach(d => {
            const data = { id: d.id, ...d.data(), type: col };
            allListings.push(data);
            if (data.status === "sold") soldCount++;
          });
        }));

        allListings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        setListings(allListings);
        setStats({ total: allListings.length, sold: soldCount });
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    fetchSellerData();
  }, [userId]);

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">{t('common.loading')}</div>;
  if (!seller) return <div className="text-center py-20 text-gray-500">User not found.</div>;

  return (
    <div className={`max-w-6xl mx-auto py-12 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-brand-100/20 border border-gray-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-brand-400 to-brand-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl rotate-3">
            <User size={64} className="-rotate-3" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className={`flex flex-col md:flex-row items-center gap-3 mb-2 ${isAr ? 'md:flex-row-reverse' : ''}`}>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{seller.name}</h1>
              {stats.sold >= 3 && (
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                  <ShieldCheck size={14} /> {isAr ? 'بائع موثوق' : 'Trusted Seller'}
                </div>
              )}
            </div>
            
            <div className={`flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 font-medium mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{isAr ? 'انضم في ' : 'Joined '} {seller.createdAt?.toDate ? seller.createdAt.toDate().toLocaleDateString() : '2024'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span>{isAr ? 'تقييم ممتاز' : 'Top Rated'}</span>
              </div>
            </div>

            <div className={`grid grid-cols-2 md:flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{isAr ? 'الإعلانات' : 'Ads'}</p>
                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-brand-50 px-6 py-4 rounded-3xl border border-brand-100">
                <p className="text-[10px] text-brand-400 font-black uppercase tracking-widest mb-1">{isAr ? 'مبيعات' : 'Sales'}</p>
                <p className="text-2xl font-black text-brand-600">{stats.sold}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className={`text-3xl font-black text-gray-900 flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <Package className="text-brand-500" /> {isAr ? 'إعلانات البائع' : 'Seller Listings'}
        </h2>

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 text-gray-400 font-bold">
            {isAr ? 'لا توجد إعلانات حالياً' : 'No listings found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(item => (
              <ListingCard key={item.id} item={item} type={item.type} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
