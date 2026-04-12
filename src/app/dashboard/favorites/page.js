"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const { favorites, loading: favLoading } = useFavorites();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function fetchFavoritedPets() {
      if (favorites.length === 0) {
        setPets([]);
        setLoading(false);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "pets"));
        // Filter locally since Firestore IN limits to 10 and we don't have a complex query setup
        const allPets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const favPets = allPets.filter(pet => favorites.includes(pet.id));
        setPets(favPets);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (!favLoading && user) {
      fetchFavoritedPets();
    }
  }, [favorites, favLoading, user, authLoading, router]);

  if (authLoading || favLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Loading your favorites...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites ({pets.length})</h1>
        <p className="text-gray-500">Pets you've loved and saved for later.</p>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <span className="text-4xl block mb-4">❤️</span>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-4">You haven't added any pets to your favorites list.</p>
          <button onClick={() => router.push('/pets')} className="text-brand-500 font-bold hover:underline">
            Explore Pets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
