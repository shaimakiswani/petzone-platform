"use client";

import { useEffect, useState, use } from "react";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { ArrowLeft, Phone, Package, CheckCircle2, User, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import TranslateButton from "@/components/TranslateButton";

export default function SupplyDetails({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t, isAr } = useLanguage();
  
  const [supply, setSupply] = useState(null);
  const [sellerStats, setSellerStats] = useState({ sold: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "supplies", unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setSupply(data);

          // Fetch Seller Stats
          const collections = ["pets", "supplies", "clinics", "hostels"];
          let soldCount = 0;
          let totalCount = 0;

          await Promise.all(collections.map(async (col) => {
            const q = query(collection(db, col), where("userId", "==", data.userId));
            const snap = await getDocs(q);
            totalCount += snap.size;
            snap.docs.forEach(d => {
              if (d.data().status === "sold") soldCount++;
            });
          }));
          setSellerStats({ sold: soldCount, total: totalCount });

          // Check if current user has requested
          if (user) {
            const qReq = query(
              collection(db, "requests"), 
              where("itemId", "==", unwrappedParams.id),
              where("buyerId", "==", user.uid)
            );
            const snapReq = await getDocs(qReq);
            if (!snapReq.empty) setHasRequested(true);
          }
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, [unwrappedParams.id, user]);

  const handleRequest = async () => {
    if (!user) return router.push("/login");
    if (user.uid === supply.userId) return alert("This is your own listing!");
    
    setRequesting(true);
    try {
      await addDoc(collection(db, "requests"), {
        itemId: supply.id,
        itemType: "supply",
        itemName: supply.name,
        itemImage: supply.image,
        buyerId: user.uid,
        buyerName: user.displayName || "Interested User",
        sellerId: supply.userId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setHasRequested(true);
      alert(isAr ? "تم إرسال طلب الشراء بنجاح!" : "Purchase request sent successfully!");
    } catch (err) { alert("Error sending request."); } 
    finally { setRequesting(false); }
  };

  const handleMessage = async () => {
    if (!user) return router.push("/login");
    if (user.uid === supply.userId) return;

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(d => d.data().participants.includes(supply.userId));

      if (existing) {
        router.push(`/profile?tab=messages&chatId=${existing.id}`);
      } else {
        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, supply.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [supply.userId]: supply.userDisplayName || "Seller"
          },
          lastMessage: "Started a conversation",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          unreadBy: [supply.userId]
        });
        router.push(`/profile?tab=messages&chatId=${docRef.id}`);
      }
    } catch (err) { alert("Error starting chat."); }
  };

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">{t('common.loading')}</div>;
  if (!supply) return <div className="text-center py-20 text-gray-500">Item not found.</div>;

  const isSold = supply.status === "sold";

  return (
    <div className={`max-w-6xl mx-auto py-8 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      <Link href="/supplies" className={`flex items-center text-gray-400 hover:text-brand-500 transition-all mb-8 font-black group w-fit ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform ${isAr ? 'ml-3' : 'mr-3'}`}>
          <ArrowLeft size={18} className={isAr ? 'rotate-180' : ''} />
        </div>
        {t('details.back_supplies')}
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-1/2 sticky top-8">
           <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-brand-100/30 border border-gray-50 relative overflow-hidden group">
              <div className="aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden relative">
                {isSold && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <span className="bg-white text-brand-600 px-10 py-4 rounded-2xl font-black text-3xl rotate-[-5deg] shadow-2xl border-4 border-brand-500 scale-110">
                      {isAr ? "تم البيع" : "SOLD"}
                    </span>
                  </div>
                )}
                <img 
                  src={supply.activeImage || supply.image} 
                  className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-700" 
                  alt={supply.name}
                />
              </div>

              {/* Thumbnails */}
              {supply.gallery && supply.gallery.length > 0 && (
                <div className="flex gap-3 p-4 mt-2 overflow-x-auto hide-scrollbar">
                  <button 
                    onClick={() => setSupply({...supply, activeImage: supply.image})}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${(!supply.activeImage || supply.activeImage === supply.image) ? 'border-brand-500 scale-105 shadow-lg' : 'border-gray-100 opacity-60'}`}
                  >
                    <img src={supply.image} className="w-full h-full object-cover" />
                  </button>
                  {supply.gallery.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSupply({...supply, activeImage: img})}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${supply.activeImage === img ? 'border-brand-500 scale-105 shadow-lg' : 'border-gray-100 opacity-60'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className={`${isAr ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-2 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20">
                {t(`categories.${supply.category?.toLowerCase() || 'other'}`)}
              </span>
              <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black border border-gray-100">
                <MapPin size={12} className="text-brand-400" /> {supply.location}
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{supply.name}</h1>
            
            <p className="text-5xl font-black text-brand-600 mb-8 tabular-nums">
              <span className="text-2xl font-bold opacity-50 mr-1">{isAr ? 'دينار' : 'JOD'}</span>
              {supply.price}
            </p>

            {/* Seller Quick Info */}
            <Link href={`/user/${supply.userId}`} className={`flex items-center gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500">
                <User size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-lg">{supply.userDisplayName || "Seller"}</h3>
                <div className={`flex items-center gap-4 text-xs font-bold text-gray-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="flex items-center gap-1"><Package size={14} className="text-brand-400" /> {sellerStats.total} {isAr ? 'إعلانات' : 'Ads'}</span>
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><CheckCircle2 size={14} /> {sellerStats.sold} {isAr ? 'مبيعات' : 'Sales'}</span>
                </div>
              </div>
              <div className="text-brand-500 font-black text-sm transition-transform">
                {isAr ? 'عرض الملف ←' : 'View Profile →'}
              </div>
            </Link>

            {/* Description */}
            <div className="space-y-4 mb-10">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <div className="w-2 h-6 bg-brand-500 rounded-full"></div>
                {t('details.item_desc')}
              </h2>
              <p className="text-gray-600 leading-relaxed text-xl whitespace-pre-wrap italic">
                {supply.description || t('details.no_desc')}
              </p>
              <TranslateButton text={supply.description} className="pt-2" />
            </div>

            {/* Features */}
            <div className="space-y-4 mb-12">
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <div className="w-2 h-6 bg-brand-500 rounded-full"></div>
                {t('details.features')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {supply.features?.map((f, i) => (
                  <div key={i} className={`flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-bold text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-brand-50 rounded-[3rem] p-8 border border-brand-100 shadow-xl shadow-brand-500/5 space-y-6">
              <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                 <div className={`${isAr ? 'text-right' : ''}`}>
                    <p className="text-xs font-black text-brand-400 uppercase tracking-widest mb-1">{isAr ? 'الحالة' : 'Status'}</p>
                    <p className="text-xl font-black text-gray-900">{isSold ? (isAr ? 'تم البيع' : 'Sold Out') : (isAr ? 'متوفر' : 'Available')}</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                   <ShieldCheck className="text-emerald-500" size={24} />
                 </div>
              </div>

              <button 
                onClick={handleRequest}
                disabled={isSold || hasRequested || requesting}
                className={`w-full font-black py-5 rounded-[2rem] transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-3 text-xl ${
                  isSold ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" :
                  hasRequested ? "bg-white text-emerald-600 border-4 border-emerald-500 shadow-none cursor-default" :
                  "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/40"
                }`}
              >
                {isSold ? (isAr ? "تم البيع" : "Sold Out") : 
                 hasRequested ? (
                   <>
                     <CheckCircle2 size={28} />
                     {isAr ? "تم إرسال الطلب" : "Request Sent"}
                   </>
                 ) : 
                 requesting ? (isAr ? "جاري الإرسال..." : "Sending...") :
                 (isAr ? "طلب شراء الآن" : "Purchase Request")}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CopyPhoneButton phone={supply.phone} />
                <button 
                  onClick={handleMessage}
                  className="w-full bg-white border-2 border-brand-500 text-brand-500 font-black py-4 rounded-[1.5rem] hover:bg-brand-50 transition shadow-sm"
                >
                  {t('details.msg_seller')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
