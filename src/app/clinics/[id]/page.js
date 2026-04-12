"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { ArrowLeft, Phone, MapPin, Star } from "lucide-react";
import Link from "next/link";
import CopyPhoneButton from "@/components/CopyPhoneButton";

export default function ClinicDetails({ params }) {
  const unwrappedParams = use(params);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinic() {
      try {
        const docRef = doc(db, "clinics", unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClinic({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClinic();
  }, [unwrappedParams.id]);

  if (loading) return <div className="text-center py-20 text-brand-500 font-bold">Loading Clinic...</div>;
  if (!clinic) return <div className="text-center py-20 text-gray-500">Clinic not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/clinics" className="flex items-center text-gray-500 hover:text-brand-500 transition mb-6 w-fit">
        <ArrowLeft size={20} className="mr-2" /> Back to Clinics
      </Link>
      
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 bg-blue-50 flex items-center justify-center min-h-[300px]">
          {clinic.image ? (
            <img src={clinic.image} alt={clinic.name} className="w-full h-auto object-cover rounded-2xl shadow-md" />
          ) : (
            <span className="text-8xl">🏥</span>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-yellow-400 fill-yellow-400" size={24} />
            <span className="text-xl font-bold text-gray-800">{clinic.rating || "5.0"} Rating</span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{clinic.name}</h1>
          
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <MapPin size={20} />
            <span className="text-lg">{clinic.location}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Available Treatments</h2>
            <div className="grid grid-cols-2 gap-3">
              {clinic.services?.map((service, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-blue-50/50 px-4 py-2.5 rounded-2xl border border-blue-100/50">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-sm font-bold tracking-tight">{service}</span>
                </div>
              ))}
              {(!clinic.services || clinic.services.length === 0) && (
                <p className="text-gray-400 text-sm">Professional veterinary services provided.</p>
              )}
            </div>
          </div>
          
          <div className="mb-8 flex-1 text-sm bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Expertise & Notes</h2>
            <p className="text-gray-600 leading-relaxed">{clinic.description || "Certified clinic dedicated to animal health and well-being with state-of-the-art diagnostics."}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-3xl mt-auto shadow-inner">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-brand-500" /> Contact Reception
            </h3>
            <CopyPhoneButton phone={clinic.phone} />
            
            <button className="w-full mt-4 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition shadow-sm">
              Visit Website
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-2">Emergency Services</h4>
          <p className="text-sm text-gray-500">24/7 care for urgent medical needs and diagnostics.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-2">Modern Equipment</h4>
          <p className="text-sm text-gray-500">State-of-the-art X-ray, Ultrasound and Lab testing.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-2">Expert Vets</h4>
          <p className="text-sm text-gray-500">Certified professionals with over 10 years experience.</p>
        </div>
      </div>
    </div>
  );
}
