"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { ArrowLeft, Phone, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";

export default function SupplyDetails({ params }) {
  const unwrappedParams = use(params);
  const [supply, setSupply] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="md:w-1/2 p-8 bg-orange-50 flex items-center justify-center min-h-[300px]">
          {supply.image ? (
            <img src={supply.image} alt={supply.name} className="w-full h-auto object-cover rounded-2xl shadow-md" />
          ) : (
            <span className="text-8xl">🛍️</span>
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
          
          <div className="bg-gray-50 p-6 rounded-2xl mt-auto">
            <h3 className="font-bold text-gray-900 mb-4">Contact Seller</h3>
            <CopyPhoneButton phone={supply.phone} />
          </div>
        </div>
      </div>
    </div>
  );
}
