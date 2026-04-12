"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Phone, ArrowLeft, Heart, CheckCircle2, Mars, Venus } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { use } from "react";
import CopyPhoneButton from "@/components/CopyPhoneButton";

export default function PetDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

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
      {/* Header Image */}
      <div className="h-64 md:h-96 w-full bg-brand-50 relative">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 transition backdrop-blur-sm z-10 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => toggleFavorite(pet.id)}
          className={`absolute top-4 right-4 p-3 rounded-full transition backdrop-blur-sm z-10 shadow-sm ${
            favorited ? "bg-brand-500 text-white" : "bg-white/80 text-gray-400 hover:text-brand-500 hover:bg-white"
          }`}
        >
          <Heart size={20} fill={favorited ? "currentColor" : "none"} />
        </button>
        <div className="w-full h-full flex flex-col items-center justify-center text-brand-300">
          {pet.image ? (
            <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-4xl">🐾</span>
              <p className="mt-2 text-sm font-medium">No Image Provided</p>
            </>
          )}
        </div>
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
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Owner</h3>
              {!user ? (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">You must be logged in to view contact details.</p>
                  <button 
                    onClick={() => router.push('/login')}
                    className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition"
                  >
                    Login to Contact
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CopyPhoneButton phone={pet.phone} />
                  <button className="w-full border-2 border-brand-500 text-brand-500 font-bold py-3 rounded-xl hover:bg-brand-50 transition">
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
