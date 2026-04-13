"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { compressImage } from "@/utils/imageCompressor";

import { X as CloseIcon } from "lucide-react";

export default function AddSupplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "Food", 
    price: "", 
    phone: "", 
    image: "", 
    gallery: [],
    description: "" 
  });
  const [features, setFeatures] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const FEATURE_OPTIONS = ["New Condition", "Used", "Warranty", "Quick Delivery", "Original Packaging"];

  const toggleFeature = (feature) => {
    setFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
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
      await addDoc(collection(db, "supplies"), {
        ...formData,
        features: features,
        price: Number(formData.price),
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      alert("Supply listed successfully!");
      router.push("/supplies");
    } catch (err) { alert("Failed"); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sell Supplies</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <option value="Food">Food</option>
              <option value="Toys">Toys</option>
              <option value="Accessories">Accessories</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="+1 (555) 000-0000" />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Card Cover Image (Required)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload} 
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white" 
              />
              {formData.image && <div className="mt-3 relative w-20 h-20"><img src={formData.image} className="w-full h-full object-cover rounded-lg shadow-sm" /></div>}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">2. Additional Gallery Images (Max 5)</label>
            <input 
              type="file" 
              multiple
              accept="image/*" 
              onChange={handleGalleryUpload} 
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700" 
            />
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {formData.gallery.map((img, i) => (
                <div key={i} className="relative shrink-0 w-16 h-16 group">
                  <img src={img} className="w-full h-full object-cover rounded-lg shadow-sm" />
                  <button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><CloseIcon size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Item Features</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURE_OPTIONS.map(feature => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  features.includes(feature)
                    ? "bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "bg-white border-gray-200 text-gray-600 hover:border-brand-200"
                }`}
              >
                {feature}
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
             placeholder="Tell us more about the item..."
           ></textarea>
        </div>
        <button disabled={submitting} type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition">Publish Listing</button>
      </form>
    </div>
  );
}
