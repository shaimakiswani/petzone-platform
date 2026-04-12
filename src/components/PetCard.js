import { Heart, MapPin, Mars, Venus } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";

export default function PetCard({ pet, type = "pets" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(pet.id);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition group relative">
      {/* Image */}
      <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
        {pet.image ? (
          <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-300">No Image</div>
        )}
        <button 
          onClick={() => toggleFavorite(pet.id)}
          className={`absolute top-4 right-4 p-2 rounded-full transition backdrop-blur-sm z-10 ${
            favorited ? "bg-brand-500 text-white" : "bg-white/80 text-gray-400 hover:text-brand-500 hover:bg-white"
          }`}
        >
          <Heart size={18} fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
          <span className="text-brand-600 font-bold bg-brand-50 px-2 py-1 rounded-md text-sm">{pet.price === 0 ? "Free" : `$${pet.price}`}</span>
        </div>
        
        <div className="text-gray-500 text-[10px] mb-4 flex flex-wrap gap-2 items-center">
          <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
            {pet.type === 'Dog' ? '🐶 Dog' : pet.type === 'Cat' ? '🐱 Cat' : pet.type === 'Bird' ? '🦜 Bird' : `🐾 ${pet.type}`}
          </span>
          <span className="bg-brand-50 dark:bg-slate-700/50 text-brand-600 dark:text-slate-300 px-2 py-1 rounded-full font-bold">{pet.breed}</span>
          <span className="bg-brand-50 dark:bg-slate-700/50 text-brand-600 dark:text-slate-300 px-2 py-1 rounded-full font-bold">{pet.age}</span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full font-bold ${pet.gender === 'Male' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
            {pet.gender === 'Male' ? <Mars size={12} /> : <Venus size={12} />}
            {pet.gender}
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
          <MapPin size={14} />
          <span>{pet.location}</span>
        </div>

        <Link href={`/${type}/${pet.id}`} className="block w-full text-center bg-gray-50 hover:bg-brand-50 hover:text-brand-600 text-gray-700 font-medium py-3 rounded-xl transition">
          View Details
        </Link>
      </div>
    </div>
  );
}
