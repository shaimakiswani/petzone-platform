import { Heart, MapPin, Mars, Venus, Star, Package, ShieldCheck, Home } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function ListingCard({ item, type = "pets" }) {
  const { user } = useAuth();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(item.id);

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
      // Check for existing chat
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
        // Fetch real owner name from profile
        const ownerSnap = await getDoc(doc(db, "users", item.userId));
        const ownerName = ownerSnap.exists() ? ownerSnap.data().name : (item.userDisplayName || "Owner");

        // Create new chat
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

  // Icon mapping for fallback images
  const FallbackIcon = () => {
    if (type === 'pets') return <span className="text-4xl text-brand-300">🐾</span>;
    if (type === 'supplies') return <Package className="w-12 h-12 text-brand-300" />;
    if (type === 'clinics') return <ShieldCheck className="w-12 h-12 text-brand-300" />;
    if (type === 'hostels') return <Home className="w-12 h-12 text-brand-300" />;
    return <span className="text-4xl">📦</span>;
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition group relative flex flex-col h-full">
      {/* Image Section */}
      <div className="h-52 w-full bg-gray-50 relative overflow-hidden shrink-0">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50">
            <FallbackIcon />
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={() => toggleFavorite(item.id)}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition backdrop-blur-sm z-10 ${
            favorited ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" : "bg-white/90 text-gray-400 hover:text-brand-500 hover:bg-white"
          }`}
        >
          <Heart size={20} fill={favorited ? "currentColor" : "none"} strokeWidth={2.5} />
        </button>

        {/* Dynamic Category Tag */}
        {item.category && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-10">
            {item.category}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        {/* Header: Title & Price */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-xl font-extrabold text-gray-900 leading-tight truncate">{item.name}</h3>
          <div className="shrink-0 flex flex-col items-end">
             <span className="text-brand-600 font-extrabold bg-brand-50 px-3 py-1.5 rounded-xl text-sm shadow-sm border border-brand-100/50">
                {item.price === 0 || !item.price ? "Free" : `$${item.price}`}
             </span>
             {type === 'hostels' && <span className="text-[10px] text-gray-400 font-bold mt-1">per night</span>}
          </div>
        </div>

        {/* Dynamic Stickers area */}
        <div className="flex flex-wrap gap-2 mb-5">
           {type === 'pets' && (
              <>
                <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-100">
                   {item.type === 'Dog' ? '🐶 Dog' : item.type === 'Cat' ? '🐱 Cat' : `🐾 ${item.type}`}
                </span>
                <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-100">{item.breed}</span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${item.gender === 'Male' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-pink-50 text-pink-600 border-pink-100'}`}>
                   {item.gender === 'Male' ? <Mars size={10} /> : <Venus size={10} />}
                   {item.gender}
                </span>
              </>
           )}
           {type === 'clinics' && (
              <>
                <div className="flex items-center text-xs text-yellow-500 font-black bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                   <Star size={12} className="fill-current mr-1" />
                   {item.rating || "4.8"}
                </div>
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-blue-100">Verified</span>
              </>
           )}
           {type === 'supplies' && !item.category && (
              <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-orange-100 uppercase tracking-widest">Premium</span>
           )}
           {type === 'hostels' && (
              <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-purple-100 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={12} /> Safe Stay
              </span>
           )}
        </div>

        {/* Location & Contact area (Smaller, dim) */}
        <div className="mt-auto space-y-4">
           <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-400 text-xs">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{item.location || "Online"}</span>
              </div>
              {item.phone && (
                <div className="flex items-center gap-1 shrink-0 bg-brand-50/50 px-2 py-0.5 rounded-md font-black text-brand-700 border border-brand-100/30">
                  {item.phone}
                </div>
              )}
           </div>

           {/* Buttons Area */}
           <div className="grid grid-cols-2 gap-3">
              <Link 
                href={`/${type}/${item.id}`} 
                className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-extrabold py-3 rounded-2xl transition duration-300 text-xs tracking-tight border border-gray-100 shadow-sm"
              >
                Details
              </Link>
              <button 
                onClick={handleMessage}
                disabled={!item.userId}
                className={`flex items-center justify-center gap-2 bg-brand-500 text-white font-extrabold py-3 rounded-2xl hover:bg-brand-600 transition duration-300 shadow-lg shadow-brand-500/20 text-xs tracking-tight ${!item.userId ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                Message
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
