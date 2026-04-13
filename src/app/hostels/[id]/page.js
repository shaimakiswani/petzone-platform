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
import { ArrowLeft, Phone, MapPin, Moon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HostelDetails({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = async () => {
    if (!user) {
      alert("Please login to message the owner.");
      router.push("/login");
      return;
    }
    if (user.uid === hostel.userId) return alert("This is your own listing!");

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(d => d.data().participants.includes(hostel.userId));

      if (existing) {
        router.push(`/profile?tab=messages&chatId=${existing.id}`);
      } else {
        // Fetch real owner name
        const ownerSnap = await getDoc(doc(db, "users", hostel.userId));
        const ownerName = ownerSnap.exists() ? ownerSnap.data().name : (hostel.userDisplayName || "Hostel Owner");

        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, hostel.userId],
          participantNames: {
            [user.uid]: user.displayName || "User",
            [hostel.userId]: ownerName
          },
          lastMessage: "Started a conversation",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          unreadBy: [hostel.userId]
        });
        router.push(`/profile?tab=messages&chatId=${docRef.id}`);
      }
    } catch (err) { alert("Error starting chat."); }
  };

  useEffect(() => {
    async function fetchHostel() {
      try {
        const docRef = doc(db, "hostels", unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHostel({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHostel();
  }, [unwrappedParams.id]);

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">Loading Hostel...</div>;
  if (!hostel) return <div className="text-center py-20 text-gray-500">Hostel not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/hostels" className="flex items-center text-gray-500 hover:text-brand-500 transition mb-6 w-fit">
        <ArrowLeft size={20} className="mr-2" /> Back to Hostels
      </Link>
      
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2 p-2 bg-slate-50 relative min-h-[400px]">
          <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
            {hostel.image ? (
              <img 
                src={hostel.gallery && hostel.gallery.length > 0 && hostel.activeImage ? hostel.activeImage : hostel.image} 
                className="w-full h-full object-cover transition duration-500 shadow-md" 
              />
            ) : (
              <span className="text-8xl">🏡</span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {hostel.gallery && hostel.gallery.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <button 
                onClick={() => setHostel({...hostel, activeImage: hostel.image})}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${!hostel.activeImage || hostel.activeImage === hostel.image ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'}`}
              >
                <img src={hostel.image} className="w-full h-full object-cover" />
              </button>
              {hostel.gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setHostel({...hostel, activeImage: img})}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${hostel.activeImage === img ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-purple-600 bg-purple-100 w-fit px-4 py-1.5 rounded-full font-bold">
            <Moon size={18} />
            <span>Overnight Stay</span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{hostel.name}</h1>
          <p className="text-3xl font-black text-brand-500 mb-6">${hostel.price} <span className="text-lg font-normal text-gray-500">/ night</span></p>

          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <MapPin size={20} />
            <span className="text-lg">{hostel.location}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Included Services</h2>
            <div className="grid grid-cols-2 gap-3">
              {hostel.features?.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <CheckCircle2 size={16} className="text-brand-500" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
              {(!hostel.features || hostel.features.length === 0) && (
                <p className="text-gray-400 text-sm">Standard hostel services included.</p>
              )}
            </div>
          </div>
          
          <div className="mb-8 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{hostel.description || "No description provided."}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-3xl mt-auto shadow-inner border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-brand-500" /> Contact Hostel
            </h3>
            <div className="space-y-3">
              <CopyPhoneButton phone={hostel.phone} />
              <button 
                onClick={handleMessage}
                className="w-full bg-white border-2 border-brand-500 text-brand-500 font-bold py-3 rounded-xl hover:bg-brand-50 transition shadow-sm"
              >
                Message Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
