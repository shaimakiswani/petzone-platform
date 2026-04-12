"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { compressImage } from "@/utils/imageCompressor";

export default function AddClinicPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", location: "", rating: "5.0", phone: "", image: "", description: "" });
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const SERVICE_OPTIONS = ["Emergency 24/7", "Surgery", "Pharmacy", "Laboratory", "Vaccination", "X-Ray"];

  const toggleService = (service) => {
    setServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({...prev, image: compressedDataUrl}));
    } catch (err) {
      alert("Error processing image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "clinics"), {
        ...formData,
        services: services,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      alert("Clinic listed successfully!");
      router.push("/clinics");
    } catch (err) { alert("Failed"); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add a Clinic</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Clinic Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 mb-3">Clinic Services</label>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             {SERVICE_OPTIONS.map(service => (
               <button
                 key={service}
                 type="button"
                 onClick={() => toggleService(service)}
                 className={`flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-medium transition ${
                   services.includes(service)
                     ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20"
                     : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                 }`}
               >
                 {service}
               </button>
             ))}
           </div>
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Description</label>
           <textarea 
             required 
             rows={4}
             value={formData.description} 
             onChange={e => setFormData({...formData, description: e.target.value})} 
             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none"
             placeholder="Tell us more about your clinic..."
           ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone</label>
            <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload (Gallery)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100" 
            />
            {formData.image && <p className="text-xs text-green-600 mt-2">Image attached!</p>}
          </div>
        </div>
        <button disabled={submitting} type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition">Publish Clinic</button>
      </form>
    </div>
  );
}
