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
import { ArrowLeft, Phone, Package, CheckCircle2 } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    async function checkRequestStatus() {
      if (user && unwrappedParams.id) {
        const q = query(
          collection(db, "requests"), 
          where("itemId", "==", unwrappedParams.id),
          where("buyerId", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) setHasRequested(true);
      }
    }
    checkRequestStatus();
  }, [user, unwrappedParams.id]);

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
    } catch (err) {
      alert("Error sending request.");
    } finally {
      setRequesting(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      alert("Please login to message the owner.");
      router.push("/login");
      return;
    }
    if (user.uid === supply.userId) return alert("This is your own listing!");

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(d => d.data().participants.includes(supply.userId));

      if (existing) {
        router.push(`/profile?tab=messages&chatId=${existing.id}`);
      } else {
        // Fetch real owner name
        const ownerSnap = await getDoc(doc(db, "users", supply.userId));
        const ownerName = ownerSnap.exists() ? ownerSnap.data().name : (supply.userDisplayName || "Seller");

        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, supply.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [supply.userId]: ownerName
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

  useEffect(() => {
    async function fetchSupply() {
      try {
        const docRef = doc(db, "supplies", unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSupply({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupply();
  }, [unwrappedParams.id]);

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">{t('common.loading')}</div>;
  if (!supply) return <div className="text-center py-20 text-gray-500">Supply not found.</div>;

  const isSold = supply.status === "sold";

  return (
    <div className={`max-w-4xl mx-auto py-8 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      <Link href="/supplies" className={`flex items-center text-gray-500 hover:text-brand-500 transition mb-6 w-fit ${isAr ? 'flex-row-reverse text-right' : ''}`}>
        <ArrowLeft size={20} className={isAr ? 'ml-2 rotate-180' : 'mr-2'} /> {t('details.back_supplies')}
      </Link>
      
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-100/20 border border-gray-100 flex flex-col md:flex-row min-h-[500px]">
        <div className="md:w-1/2 p-4 bg-slate-50 relative">
          {isSold && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-l-[2rem]">
              <span className="bg-white text-brand-600 px-8 py-3 rounded-2xl font-black text-2xl rotate-[-5deg] shadow-2xl border-4 border-brand-500">
                {isAr ? "تم البيع" : "SOLD"}
              </span>
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-3xl bg-white shadow-inner">
            {supply.image ? (
              <img 
                src={supply.gallery && supply.gallery.length > 0 && supply.activeImage ? supply.activeImage : supply.image} 
                className="w-full h-full object-contain p-4 transition duration-500" 
              />
            ) : (
              <span className="text-8xl">🛍️</span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {supply.gallery && supply.gallery.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
              <button 
                onClick={() => setSupply({...supply, activeImage: supply.image})}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${!supply.activeImage || supply.activeImage === supply.image ? 'border-brand-500 scale-110 shadow-md' : 'border-transparent opacity-70'}`}
              >
                <img src={supply.image} className="w-full h-full object-cover" />
              </button>
              {supply.gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSupply({...supply, activeImage: img})}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${supply.activeImage === img ? 'border-brand-500 scale-110 shadow-md' : 'border-transparent opacity-70'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className={`md:w-1/2 p-10 flex flex-col ${isAr ? 'text-right' : 'text-left'}`}>
          <div className={`mb-4 ${isAr ? 'flex justify-end' : ''}`}>
            <span className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-brand-500/20">
              {t(`categories.${supply.category?.toLowerCase() || 'other'}`)}
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">{supply.name}</h1>
          <p className="text-4xl font-black text-brand-500 mb-8 flex items-baseline gap-1">
            <span className="text-xl font-bold">{isAr ? 'دينار' : 'JOD'}</span>
            {supply.price}
          </p>
          
          <div className="mb-10 flex-1">
            <h2 className="text-xl font-black text-gray-900 mb-4">{t('details.item_desc')}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-2 text-lg italic">{supply.description || t('details.no_desc')}</p>
            <TranslateButton text={supply.description} className="mb-10" />

            <h2 className={`text-xl font-black text-gray-900 mb-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Package size={22} className="text-brand-500" /> {t('details.features')}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {supply.features?.map((feature, idx) => (
                <div key={idx} className={`flex items-center gap-3 text-gray-700 bg-brand-50/30 px-4 py-3 rounded-2xl border border-brand-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <CheckCircle2 size={18} className="text-brand-500 shrink-0" />
                  <span className="text-sm font-bold">{feature}</span>
                </div>
              ))}
              {(!supply.features || supply.features.length === 0) && (
                <p className="text-gray-400 text-sm font-medium">{t('details.std_supply')}</p>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-[2rem] mt-auto shadow-inner border border-gray-100 space-y-4">
            <button 
              onClick={handleRequest}
              disabled={isSold || hasRequested || requesting}
              className={`w-full font-black py-4 rounded-xl transition shadow-xl flex items-center justify-center gap-2 text-lg ${
                isSold ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" :
                hasRequested ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500 cursor-default shadow-none" :
                "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/40"
              }`}
            >
              {isSold ? (isAr ? "تم البيع" : "Sold") : 
               hasRequested ? (
                 <>
                   <CheckCircle2 size={24} />
                   {isAr ? "تم إرسال الطلب" : "Request Sent"}
                 </>
               ) : 
               requesting ? (isAr ? "جاري الإرسال..." : "Sending...") :
               (isAr ? "اطلب الشراء الآن" : "Request to Buy Now")}
            </button>

            <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
              <CopyPhoneButton phone={supply.phone} />
              <button 
                onClick={handleMessage}
                className="w-full bg-white border-2 border-brand-500 text-brand-500 font-black py-3 rounded-xl hover:bg-brand-50 transition shadow-sm text-sm"
              >
                {t('details.msg_seller')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
