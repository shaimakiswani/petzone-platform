"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { compressImage } from "@/utils/imageCompressor";
import { SUPPLY_DATA } from "@/constants/petData";

import { X as CloseIcon } from "lucide-react";

export default function AddSupplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "Housing & Carriers", 
    subCategory: "Dog House",
    condition: "New",
    price: "", 
    phone: "", 
    image: "", 
    gallery: [],
    description: "" 
  });
  const [features, setFeatures] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const FEATURE_OPTIONS = ["Warranty", "Quick Delivery", "Original Packaging", "Safe for Pets", "High Quality"];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subCategory: SUPPLY_DATA[value]?.items[0] || "Other"
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        userDisplayName: user.displayName || user.email.split("@")[0],
        createdAt: new Date().toISOString()
      });
      alert("Supply listed successfully!");
      router.push("/supplies");
    } catch (err) { alert("Failed"); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display text-center">Sell Supplies</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Item Title</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" placeholder="e.g. Ergonomic Dog House" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Item Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, condition: 'New'})}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                  formData.condition === 'New' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-brand-200'
                }`}
              >
                ✨ New (جديد)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, condition: 'Used'})}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                  formData.condition === 'Used' 
                    ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-brand-200'
                }`}
              >
                ♻️ Used (مستعمل)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none">
              {Object.keys(SUPPLY_DATA).map(key => (
                <option key={key} value={key}>{SUPPLY_DATA[key].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Specific Item</label>
            <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none">
              {SUPPLY_DATA[formData.category]?.items.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" placeholder="0.00" />
          </div>
          <div className="hidden">
            {/* Kept for structure similarity if needed */}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">Product Media Assets</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Cover */}
            <div className="bg-brand-50/50 p-5 rounded-3xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition group relative">
              <label className="block text-xs font-black text-brand-600 uppercase mb-3 tracking-widest">1. Card Cover Image (Required)</label>
              <input 
                required={!formData.image}
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">The main product photo for the marketplace.</p>
              {formData.image && (
                <div className="mt-4 relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg animate-in zoom-in duration-300">
                  <img src={formData.image} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Box 2: Gallery */}
            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-slate-200 hover:border-slate-400 transition group relative">
              <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">2. Detailed Views (Max 5)</label>
              <input 
                type="file" 
                multiple
                accept="image/*" 
                onChange={handleGalleryUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">Add more angles of your item!</p>
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
