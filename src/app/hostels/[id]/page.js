"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { ArrowLeft, Phone, MapPin, Moon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";

export default function HostelDetails({ params }) {
  const unwrappedParams = use(params);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="md:w-1/2 p-8 bg-purple-50 flex items-center justify-center min-h-[300px]">
          {hostel.image ? (
            <img src={hostel.image} alt={hostel.name} className="w-full h-auto object-cover rounded-2xl shadow-md" />
          ) : (
            <span className="text-8xl">🏡</span>
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
          
          <div className="bg-gray-50 p-6 rounded-2xl mt-auto">
            <h3 className="font-bold text-gray-900 mb-4">Book a Stay</h3>
            <CopyPhoneButton phone={hostel.phone} />
          </div>
        </div>
      </div>
    </div>
  );
}
