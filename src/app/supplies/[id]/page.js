"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { ArrowLeft, Phone, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";

import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SupplyDetails({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [supply, setSupply] = useState(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/profile?tab=messages");
      } else {
        await addDoc(collection(db, "chats"), {
          participants: [user.uid, supply.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [supply.userId]: supply.name + " Seller"
          },
          lastMessage: "Started a conversation",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        router.push("/profile?tab=messages");
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

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">Loading Supply...</div>;
  if (!supply) return <div className="text-center py-20 text-gray-500">Supply not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/supplies" className="flex items-center text-gray-500 hover:text-brand-500 transition mb-6 w-fit">
        <ArrowLeft size={20} className="mr-2" /> Back to Supplies
      </Link>
      
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2 p-2 bg-slate-50 relative min-h-[400px]">
          <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
            {supply.image ? (
              <img 
                src={supply.gallery && supply.gallery.length > 0 && supply.activeImage ? supply.activeImage : supply.image} 
                className="w-full h-full object-cover transition duration-500 shadow-md" 
              />
            ) : (
              <span className="text-8xl">🛍️</span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {supply.gallery && supply.gallery.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <button 
                onClick={() => setSupply({...supply, activeImage: supply.image})}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${!supply.activeImage || supply.activeImage === supply.image ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'}`}
              >
                <img src={supply.image} className="w-full h-full object-cover" />
              </button>
              {supply.gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSupply({...supply, activeImage: img})}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${supply.activeImage === img ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="mb-4">
            <span className="bg-brand-100 text-brand-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {supply.category}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{supply.name}</h1>
          <p className="text-3xl font-black text-brand-500 mb-6">${supply.price}</p>
          
          <div className="mb-8 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Item Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">{supply.description || "No description provided."}</p>

            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-brand-500" /> Key Features
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {supply.features?.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-orange-50/50 px-3 py-2 rounded-xl border border-orange-100/50">
                  <CheckCircle2 size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
              {(!supply.features || supply.features.length === 0) && (
                <p className="text-gray-400 text-sm">Quality pet supplies for your companion.</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-3xl mt-auto shadow-inner border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-brand-500" /> Contact Seller
            </h3>
            <div className="space-y-3">
              <CopyPhoneButton phone={supply.phone} />
              <button 
                onClick={handleMessage}
                className="w-full bg-white border-2 border-brand-500 text-brand-500 font-bold py-3 rounded-xl hover:bg-brand-50 transition shadow-sm"
              >
                Message Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
