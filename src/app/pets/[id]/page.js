"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useAuth } from "@/context/AuthContext";
import { MapPin, Phone, ArrowLeft, Heart, CheckCircle2, Mars, Venus } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import CopyPhoneButton from "@/components/CopyPhoneButton";

export default function PetDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = async () => {
    if (!user) {
      alert("Please login to message the owner.");
      router.push("/login");
      return;
    }
    if (user.uid === pet.userId) return alert("This is your own listing!");

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(d => d.data().participants.includes(pet.userId));

      if (existing) {
        router.push(`/profile?tab=messages&chatId=${existing.id}`);
      } else {
        // Fetch real owner name
        const ownerSnap = await getDoc(doc(db, "users", pet.userId));
        const ownerName = ownerSnap.exists() ? ownerSnap.data().name : (pet.userDisplayName || "Pet Owner");

        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, pet.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [pet.userId]: ownerName
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

  useEffect(() => {
    async function fetchPet() {
      try {
        const docRef = doc(db, "pets", unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPet({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("No such document!");
        }
      } catch (err) {
        console.error("Error fetching pet details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (unwrappedParams.id) fetchPet();
  }, [unwrappedParams.id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading details...</div>;
  }

  if (!pet) {
    return <div className="text-center py-20 text-red-500">Pet not found!</div>;
  }

  const favorited = isFavorite(pet.id);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Image Gallery Section */}
      <div className="bg-slate-100 relative group min-h-[300px] md:min-h-[500px]">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 transition backdrop-blur-sm z-10 shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => toggleFavorite(pet.id)}
          className={`absolute top-4 right-4 p-3 rounded-full transition backdrop-blur-sm z-10 shadow-md ${
            favorited ? "bg-brand-500 text-white" : "bg-white/80 text-gray-400 hover:text-brand-500 hover:bg-white"
          }`}
        >
          <Heart size={20} fill={favorited ? "currentColor" : "none"} />
        </button>
        
        {/* Main Image View */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {pet.image ? (
            <img 
              src={pet.gallery && pet.gallery.length > 0 && pet.activeImage ? pet.activeImage : pet.image} 
              alt={pet.name} 
              className="w-full h-full object-contain max-h-[600px] transition duration-500" 
            />
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-4xl">🐾</span>
              <p className="mt-2 text-sm font-medium text-gray-400">No Image Provided</p>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {pet.gallery && pet.gallery.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
            <button 
              onClick={() => setPet({...pet, activeImage: pet.image})}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${!pet.activeImage || pet.activeImage === pet.image ? 'border-brand-500 scale-110' : 'border-transparent opacity-70'}`}
            >
              <img src={pet.image} className="w-full h-full object-cover" />
            </button>
            {pet.gallery.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setPet({...pet, activeImage: img})}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${pet.activeImage === img ? 'border-brand-500 scale-110' : 'border-transparent opacity-70'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-500">
              <span className="bg-brand-500 text-white px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-widest">
                {pet.type === 'Dog' ? '🐶 Dog' : pet.type === 'Cat' ? '🐱 Cat' : pet.type === 'Bird' ? '🦜 Bird' : `🐾 ${pet.type}`}
              </span>
              <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 px-3 py-1 rounded-lg font-medium">{pet.breed}</span>
              <span className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg">{pet.age}</span>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs ${pet.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                {pet.gender === 'Male' ? <Mars size={14} /> : <Venus size={14} />}
                {pet.gender}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-brand-500 block mb-1">
              {pet.price === 0 ? "Free" : `$${pet.price}`}
            </span>
            <div className="flex items-center gap-1 text-gray-400 justify-end">
              <MapPin size={16} />
              <span>{pet.location}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap mb-8">
              {pet.description || "No description provided."}
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Traits & Health</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {pet.features?.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-brand-50/50 px-3 py-2 rounded-xl border border-brand-100">
                  <CheckCircle2 size={16} className="text-brand-500" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
              {(!pet.features || pet.features.length === 0) && (
                <p className="text-gray-400 text-sm">All standard healthy traits.</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone size={18} className="text-brand-500" /> Contact Owner
              </h3>
              {!user ? (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">You must be logged in to view contact details.</p>
                  <button 
                    onClick={() => router.push('/login')}
                    className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition shadow-md shadow-brand-500/20"
                  >
                    Login to Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CopyPhoneButton phone={pet.phone} />
                  <button 
                    onClick={handleMessage}
                    className="w-full bg-white border-2 border-brand-500 text-brand-500 font-bold py-3 rounded-xl hover:bg-brand-50 transition shadow-sm"
                  >
                    Message Owner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
