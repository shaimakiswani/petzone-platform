import { Heart, MapPin, Mars, Venus, Star, Package, ShieldCheck, Home, AlertTriangle, X, Phone, User } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useLanguage } from "@/context/LanguageContext";
import { useState, memo, useMemo } from "react";

const ListingCard = memo(function ListingCard({ item, type = "pets" }) {
  const { user } = useAuth();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, isAr } = useLanguage();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const favorited = isFavorite(item.id);

  const placeholders = useMemo(() => {
    return {
      pets: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300&auto=format&fit=crop",
      clinics: "https://images.unsplash.com/photo-1628154791759-5770bf39a139?q=80&w=300&auto=format&fit=crop",
      supplies: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop",
      hostels: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=300&auto=format&fit=crop"
    };
  }, []);

  const displayImage = item.image || placeholders[type] || placeholders.pets;

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to report listings");
    if (!reportReason.trim()) return;

    setSubmitting(true);
    try {
      const reportId = `${user.uid}_${item.id}`;
      await setDoc(doc(db, "reports", reportId), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        listingId: item.id,
        listingName: item.name,
        listingImage: item.image,
        listingCollection: type,
        reason: reportReason,
        createdAt: serverTimestamp(),
      });
      alert("Thank you! Report submitted for review.");
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {
      console.error("Report Error:", err);
      alert("Failed to send report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      alert("Please login to message the owner.");
      router.push("/login");
      return;
    }

    if (!item.userId) {
      alert("Messaging is not available for this listing. Please use the phone number provided.");
      return;
    }

    if (user.uid === item.userId) {
      alert("This is your own listing!");
      return;
    }

    try {
      const chatRef = collection(db, "chats");
      const q = query(chatRef, 
        where("participants", "array-contains", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingChat = querySnapshot.docs.find(doc => 
        doc.data().participants.includes(item.userId)
      );

      if (existingChat) {
        router.push(`/profile?tab=messages&chatId=${existingChat.id}`);
      } else {
        const ownerSnap = await getDoc(doc(db, "users", item.userId));
        const ownerName = ownerSnap.exists() ? ownerSnap.data().name : (item.userDisplayName || "Owner");

        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, item.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [item.userId]: ownerName
          },
          lastMessage: "Started a conversation",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          unreadBy: [item.userId]
        });
        router.push(`/profile?tab=messages&chatId=${docRef.id}`);
      }
    } catch (err) {
      console.error("Message Error:", err);
      alert("Could not start chat. Please try again.");
    }
  };

  return (
    <div className="bg-brand-50/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col h-full border border-brand-100/30 hover:border-brand-200">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden group">
        <img 
          src={displayImage} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {item.status === 'sold' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-4">
            <div className="bg-white/90 text-brand-600 px-4 py-2 rounded-xl font-black text-sm rotate-[-10deg] shadow-2xl border-2 border-brand-500 scale-125">
              {isAr ? (type === 'pets' ? "تم التبني" : "تم البيع") : (type === 'pets' ? "ADOPTED" : "SOLD")}
            </div>
          </div>
        )}
        <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} flex flex-col gap-2 z-20`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleFavorite(item.id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
              favorited 
                ? "bg-brand-500 text-white shadow-brand-500/40 scale-110" 
                : "bg-white/90 text-gray-400 hover:bg-white hover:text-brand-500 hover:scale-110"
            }`}
          >
            <Heart size={18} fill={favorited ? "currentColor" : "none"} className="transition-transform" />
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowReportModal(true);
            }}
            title={t('common.report') || "Report Listing"}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-gray-400 hover:text-amber-500 shadow-lg transition-all hover:scale-110"
          >
            <AlertTriangle size={18} />
          </button>
        </div>
        
        {/* Condition Badge for Supplies */}
        {type === "supplies" && item.condition && (
          <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-tighter backdrop-blur-md shadow-lg border flex items-center gap-1.5 z-10 ${
            item.condition === "New" 
              ? "bg-emerald-500/90 text-white border-emerald-400" 
              : "bg-orange-500/90 text-white border-orange-400"
          }`}>
            {item.condition === "New" ? "✨ Brand New" : "♻️ Pre-owned"}
          </div>
        )}

        {item.isPremium && (
          <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-10 animate-in fade-in zoom-in duration-500`}>
            <div className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white px-3 py-1.5 rounded-2xl text-[10px] font-black shadow-xl flex items-center gap-1.5 border border-amber-300">
              ⭐ {t('common.premium')}
            </div>
          </div>
        )}
        
        {/* Price Badge - Only show if price is defined and not clinics usually */}
        {type !== 'clinics' && (
          <div className={`absolute bottom-4 ${isAr ? 'left-4' : 'right-4'} z-10`}>
            {item.price === 0 || item.price === "0" || item.isAdoption ? (
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-in zoom-in duration-300">
                <Heart size={16} fill="currentColor" className="animate-pulse" />
                <p className="font-black text-sm md:text-base uppercase tracking-tighter">
                  {isAr ? 'للتبني' : 'For Adoption'}
                </p>
              </div>
            ) : (
              <div className={`bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border flex items-center gap-2 ${item.isPremium ? 'border-amber-400 ring-2 ring-amber-100' : 'border-white/40 ring-1 ring-black/5'}`}>
                <p className={`font-black text-sm md:text-base ${item.isPremium ? 'text-amber-600' : 'text-brand-600'}`}>
                  {item.price} <span className="text-[10px] opacity-70">JOD</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Report Listing</h3>
              <button onClick={() => setShowReportModal(false)}><X size={20} /></button>
            </div>
            <textarea 
              className="w-full p-3 border rounded-xl mb-4 text-sm"
              placeholder="Reason for reporting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
            />
            <button 
              onClick={handleReport}
              disabled={submitting || !reportReason.trim()}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 bg-white rounded-b-[2.5rem] border-t border-brand-100/50">
        {/* Header: Title */}
        <div className={`flex justify-between items-start mb-3 gap-2 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <h3 className="text-2xl font-black text-gray-900 leading-tight truncate group-hover:text-brand-500 transition-colors">{item.name}</h3>
          <p className="text-xl font-black text-brand-600">
            {item.price === 0 || item.price === "0" ? t('common.free') : `${item.price} JOD`}
          </p>
        </div>

        {/* Tags Row */}
        <div className={`flex flex-wrap gap-2 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="bg-white px-3 py-1 rounded-xl text-[10px] font-black text-gray-400 border border-gray-100 shadow-sm">
            {item.breed || item.category || t('common.details')}
          </div>
          <div className="bg-white px-3 py-1 rounded-xl text-[10px] font-black text-gray-400 border border-gray-100 shadow-sm flex items-center gap-1">
            <MapPin size={10} className="text-brand-400" /> {item.location}
          </div>
        </div>

        {/* Seller Info Link */}
        {item.userId && (
          <Link 
            href={`/user/${item.userId}`}
            className={`flex items-center gap-2 px-3 py-2 bg-white rounded-xl hover:bg-brand-50 transition-colors mb-4 w-full border border-slate-100 ${isAr ? 'flex-row-reverse text-right' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 shadow-sm flex items-center justify-center text-brand-500">
              <User size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-0.5">{isAr ? 'صاحب الإعلان' : 'ADVERTISER'}</p>
              <p className="text-xs font-black text-gray-700 underline decoration-brand-200 underline-offset-2 truncate">
                {item.userDisplayName || (isAr ? 'مستخدم بيت زون' : 'PetZone User')}
              </p>
            </div>
            <div className="text-brand-500 font-black text-[10px]">
              {isAr ? 'الملف ←' : 'Profile →'}
            </div>
          </Link>
        )}

        {/* Dynamic Stickers area */}
        <div className={`flex flex-wrap gap-2 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
           {type === 'pets' && (
              <>
                <span className={`bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-xl text-[10px] font-black border border-slate-100 flex items-center gap-1.5 shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                   {item.type === 'Dog' ? '🐶' : item.type === 'Cat' ? '🐱' : '🐾'} {t(`categories.${item.type?.toLowerCase() || 'other'}`)}
                </span>
                <span className="bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-xl text-[10px] font-black border border-slate-100 shadow-sm">{item.breed}</span>
              </>
           )}
           {type === 'clinics' && (
              <>
                <div className={`flex items-center text-xs text-yellow-600 font-black bg-yellow-50 px-2.5 py-1.5 rounded-xl border border-yellow-100 shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                   <Star size={12} className={`fill-current ${isAr ? 'ml-1.5' : 'mr-1.5'}`} />
                   {item.rating || "4.8"}
                </div>
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-xl text-[10px] font-black border border-blue-100 shadow-sm">{t('common.verified')}</span>
              </>
           )}
           {type === 'supplies' && (
              <span className="bg-brand-50 text-brand-600 px-2.5 py-1.5 rounded-xl text-[10px] font-black border border-brand-100 shadow-sm uppercase tracking-wider">
                {t(`categories.${item.category?.toLowerCase() || 'other'}`)}
              </span>
           )}
        </div>

        {/* Location & Contact area */}
         <div className="mt-auto space-y-5">
            <div className={`flex items-center justify-between gap-4 text-gray-400 text-[11px] font-bold ${isAr ? 'flex-row-reverse text-right' : ''}`}>
               <div className={`flex items-center gap-1.5 min-w-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                 <MapPin size={14} className="text-brand-400 shrink-0" />
                 <span className="truncate">{item.location || (isAr ? "أونلاين" : "Online")}</span>
               </div>
               {item.phone && (
                 <div className="flex items-center gap-1.5 shrink-0 bg-brand-50/80 px-2.5 py-1 rounded-lg text-brand-700 border border-brand-100/50">
                    <Phone size={12} /> <span className="tabular-nums tracking-tight">{item.phone}</span>
                 </div>
               )}
            </div>

           {/* Buttons Area */}
            <div className={`grid grid-cols-2 gap-3 ${isAr ? 'rtl' : 'ltr'}`}>
               <Link 
                 href={`/${type}/${item.id}`} 
                 className="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 font-black py-3.5 rounded-2xl transition-all duration-300 text-xs tracking-tight border-2 border-gray-100 hover:border-brand-200 shadow-sm active:scale-95"
               >
                 {t('common.details')}
               </Link>
               <button 
                 onClick={handleMessage}
                 disabled={!item.userId}
                 className={`flex items-center justify-center gap-2 bg-brand-500 text-white font-black py-3.5 rounded-2xl hover:bg-brand-600 transition-all duration-300 shadow-lg shadow-brand-500/25 text-xs tracking-tight active:scale-95 ${!item.userId ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
               >
                 {t('common.message')}
               </button>
        </div>
      </div>
    </div>
  </div>
);
});

export default ListingCard;
