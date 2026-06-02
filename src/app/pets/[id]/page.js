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
import { ArrowLeft, Phone, Heart, Mars, Venus, MapPin, User, CheckCircle2, ShieldCheck, Calendar, Package } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import TranslateButton from "@/components/TranslateButton";

export default function PetDetails({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { t, isAr } = useLanguage();
  
  const [pet, setPet] = useState(null);
  const [sellerStats, setSellerStats] = useState({ sold: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "pets", unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setPet(data);

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
    if (user.uid === pet.userId) return alert("This is your own listing!");
    
    setRequesting(true);
    try {
      await addDoc(collection(db, "requests"), {
        itemId: pet.id,
        itemType: "pet",
        itemName: pet.name,
        itemImage: pet.image,
        buyerId: user.uid,
        buyerName: user.displayName || "Interested User",
        sellerId: pet.userId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setHasRequested(true);
      alert(isAr ? "تم إرسال طلب التبني بنجاح!" : "Adoption request sent successfully!");
    } catch (err) { alert("Error sending request."); } 
    finally { setRequesting(false); }
  };

  const handleMessage = async () => {
    if (!user) return router.push("/login");
    if (user.uid === pet.userId) return;

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(d => d.data().participants.includes(pet.userId));

      if (existing) {
        router.push(`/profile?tab=messages&chatId=${existing.id}`);
      } else {
        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, pet.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [pet.userId]: pet.userDisplayName || "Seller"
          },
          lastMessage: "Started a conversation",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          unreadBy: [pet.userId]
        });
        router.push(`/profile?tab=messages&chatId=${docRef.id}`);
      }
    } catch (err) { alert("Error starting chat."); }
  };

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">{t('common.loading')}</div>;
  if (!pet) return <div className="text-center py-20 text-gray-500">Pet not found.</div>;

  const isSold = pet.status === "sold";

  return (
    <div className={`max-w-6xl mx-auto py-8 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      <Link href="/pets" className={`flex items-center text-gray-400 hover:text-brand-500 transition-all mb-8 font-black group w-fit ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform ${isAr ? 'ml-3' : 'mr-3'}`}>
          <ArrowLeft size={18} className={isAr ? 'rotate-180' : ''} />
        </div>
        {t('details.back_pets')}
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-1/2 sticky top-8">
           <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-brand-100/30 border border-gray-50 relative overflow-hidden">
              <div className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden relative">
                {isSold && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <span className="bg-white text-brand-600 px-10 py-4 rounded-2xl font-black text-3xl rotate-[-5deg] shadow-2xl border-4 border-brand-500 scale-110">
                      {isAr 
                        ? (pet.price === 0 || pet.price === "0" || pet.isAdoption ? "تم التبني" : "تم البيع") 
                        : (pet.price === 0 || pet.price === "0" || pet.isAdoption ? "ADOPTED" : "SOLD")}
                    </span>
                  </div>
                )}
                <img 
                  src={pet.activeImage || pet.image} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                  alt={pet.name}
                />
              </div>

              {/* Thumbnails */}
              {pet.gallery && pet.gallery.length > 0 && (
                <div className="flex gap-3 p-4 mt-2 overflow-x-auto hide-scrollbar">
                  <button 
                    onClick={() => setPet({...pet, activeImage: pet.image})}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${(!pet.activeImage || pet.activeImage === pet.image) ? 'border-brand-500 scale-105 shadow-lg' : 'border-gray-100 opacity-60'}`}
                  >
                    <img src={pet.image} className="w-full h-full object-cover" />
                  </button>
                  {pet.gallery.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setPet({...pet, activeImage: img})}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${pet.activeImage === img ? 'border-brand-500 scale-105 shadow-lg' : 'border-gray-100 opacity-60'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Right: Content Card */}
        <div className="w-full lg:w-1/2 bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-brand-100/20 border border-gray-50 space-y-8">
          <div className={`${isAr ? 'text-right' : 'text-left'}`}>
            <div className={`flex flex-wrap items-center gap-2 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="bg-brand-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20">
                {t(`categories.${pet.type?.toLowerCase() || 'other'}`)}
              </span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${pet.gender === 'Male' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-pink-50 text-pink-600 border-pink-100'} ${isAr ? 'flex-row-reverse' : ''}`}>
                {pet.gender === 'Male' ? <Mars size={12} /> : <Venus size={12} />}
                {pet.gender === 'Male' ? t('forms.pet.genders.male') : t('forms.pet.genders.female')}
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black border border-gray-100">
                <MapPin size={12} className="text-brand-400" /> {pet.location}
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight leading-tight">{pet.name}</h1>
            <p className="text-2xl font-bold text-brand-500/60 mb-8">{pet.breed}</p>

            {/* Seller Quick Info */}
            <Link href={`/user/${pet.userId}`} className={`flex items-center gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500">
                <User size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-lg">{pet.userDisplayName || "Owner"}</h3>
                <div className={`flex items-center gap-4 text-xs font-bold text-gray-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="flex items-center gap-1"><Package size={14} className="text-brand-400" /> {sellerStats.total} {isAr ? 'إعلانات' : 'Ads'}</span>
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><CheckCircle2 size={14} /> {sellerStats.sold} {isAr ? 'تبني ناجح' : 'Adoptions'}</span>
                </div>
              </div>
              <div className="text-brand-500 font-black text-sm transition-transform">
                {isAr ? 'عرض الملف ←' : 'View Profile →'}
              </div>
            </Link>

            {/* Quick Stats Grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 ${isAr ? 'rtl' : 'ltr'}`}>
              <div className="bg-slate-50 p-4 rounded-3xl border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isAr ? 'العمر' : 'Age'}</p>
                 <p className="font-black text-gray-900">{pet.age} {isAr ? 'سنوات' : 'Years'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isAr ? 'الصحة' : 'Health'}</p>
                 <p className="font-black text-emerald-600">{isAr ? 'ممتازة' : 'Excellent'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isAr ? 'التلقيح' : 'Vaccinated'}</p>
                 <p className="font-black text-gray-900">{isAr ? 'نعم' : 'Yes'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-10">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <div className="w-2 h-6 bg-brand-500 rounded-full"></div>
                {t('details.description')}
              </h2>
              <p className="text-gray-600 leading-relaxed text-xl whitespace-pre-wrap italic">
                {pet.description || t('details.no_desc')}
              </p>
              <TranslateButton text={pet.description} className="pt-2" />
            </div>

            {/* Action Card */}
            <div className="bg-brand-50 rounded-[3rem] p-8 border border-brand-100 shadow-xl shadow-brand-500/5 space-y-6">
              <div className={`flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                 <div className={`${isAr ? 'text-right' : ''}`}>
                    <p className="text-xs font-black text-brand-400 uppercase tracking-widest mb-1">
                      {isAr 
                        ? (pet.price === 0 || pet.price === "0" || pet.isAdoption ? 'حالة التبني' : 'حالة البيع') 
                        : (pet.price === 0 || pet.price === "0" || pet.isAdoption ? 'Adoption Status' : 'Sale Status')}
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      {isSold 
                        ? (isAr 
                            ? (pet.price === 0 || pet.price === "0" || pet.isAdoption ? 'تم التبني' : 'تم البيع') 
                            : (pet.price === 0 || pet.price === "0" || pet.isAdoption ? 'Adopted' : 'Sold')) 
                        : (isAr 
                            ? (pet.price === 0 || pet.price === "0" || pet.isAdoption ? 'متاح للتبني' : 'متاح للبيع') 
                            : (pet.price === 0 || pet.price === "0" || pet.isAdoption ? 'Available for Adoption' : 'Available for Sale'))}
                    </p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                   <Heart className="text-brand-500 fill-current" size={24} />
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
                {isSold ? (isAr ? (pet.price === 0 || pet.price === "0" || pet.isAdoption ? "تم التبني" : "تم البيع") : (pet.price === 0 || pet.price === "0" || pet.isAdoption ? "Adopted" : "Sold")) : 
                  hasRequested ? (
                    <>
                      <CheckCircle2 size={28} />
                      {isAr ? "تم إرسال الطلب" : "Request Sent"}
                    </>
                  ) : 
                  requesting ? (isAr ? "جاري الإرسال..." : "Sending...") :
                  (isAr 
                    ? (pet.price === 0 || pet.price === "0" || pet.isAdoption ? "طلب تبني الآن" : "طلب شراء الآن") 
                    : (pet.price === 0 || pet.price === "0" || pet.isAdoption ? "Request Adoption" : "Request Purchase"))}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CopyPhoneButton phone={pet.phone} />
                <button 
                  onClick={handleMessage}
                  className="w-full bg-white border-2 border-brand-500 text-brand-500 font-black py-4 rounded-[1.5rem] hover:bg-brand-50 transition shadow-sm"
                >
                  {t('details.msg_owner')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
