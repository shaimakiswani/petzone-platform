"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { compressImage } from "@/utils/imageCompressor";

import { X as CloseIcon } from "lucide-react";

export default function AddClinicPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    rating: "5.0", 
    phone: "", 
    image: "", 
    gallery: [],
    description: "" 
  });
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const SERVICE_OPTIONS = ["Emergency 24/7", "Surgery", "Pharmacy", "Laboratory", "Vaccination", "X-Ray"];

  const toggleService = (service) => {
    setServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({...prev, image: compressedDataUrl}));
    } catch (err) {
      alert("Error processing image.");
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.gallery.length > 5) {
      return alert("You can only add up to 5 gallery images.");
    }
    try {
      const compressedImages = await Promise.all(files.map(file => compressImage(file)));
      setFormData(prev => ({...prev, gallery: [...prev.gallery, ...compressedImages].slice(0, 5)}));
    } catch (err) { alert("Error processing images."); }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({...prev, gallery: prev.gallery.filter((_, i) => i !== index)}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.image) return alert("Please upload a cover image!");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "clinics"), {
        ...formData,
        services: services,
        userId: user.uid,
        userDisplayName: user.displayName || user.email.split("@")[0],
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
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">Clinic Media</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Cover */}
            <div className="bg-blue-50/50 p-5 rounded-3xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition group relative">
              <label className="block text-xs font-black text-blue-600 uppercase mb-3 tracking-widest">1. Card Cover Image (Required)</label>
              <input 
                required={!formData.image}
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">Main image for the clinic list.</p>
              {formData.image && (
                <div className="mt-4 relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg animate-in zoom-in duration-300">
                  <img src={formData.image} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Box 2: Gallery */}
            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-slate-200 hover:border-slate-400 transition group relative">
              <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">2. Detailed Gallery (Max 5)</label>
              <input 
                type="file" 
                multiple
                accept="image/*" 
                onChange={handleGalleryUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">Display your facilities and equipment.</p>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                {formData.gallery.map((img, i) => (
                  <div key={i} className="relative shrink-0 w-16 h-16 group/img rounded-xl overflow-hidden border-2 border-white shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(i)} 
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-200"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button disabled={submitting} type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition">Publish Clinic</button>
      </form>
    </div>
  );
}
