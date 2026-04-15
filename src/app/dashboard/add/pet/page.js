"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/imageCompressor";
import { PET_DATA } from "@/constants/petData";

export default function AddPetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    breed: "German Shepherd",
    age: "0-6 months",
    price: "",
    location: "",
    phone: "",
    image: "",
    gallery: [],
    gender: "Male",
    description: "",
  });

  const [features, setFeatures] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const FEATURE_OPTIONS = ["Vaccinated", "House Trained", "Microchipped", "Friendly with Kids", "Neutered"];

  const toggleFeature = (feature) => {
    setFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  };

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.image) return alert("Please upload a cover image!");

    setSubmitting(true);
    try {
      await addDoc(collection(db, "pets"), {
        ...formData,
        features: features,
        userId: user.uid,
        userDisplayName: user.displayName || user.email.split("@")[0],
        price: Number(formData.price),
        createdAt: new Date().toISOString()
      });
      alert("Pet listed successfully!");
      router.push("/pets");
    } catch (err) {
      console.error(err);
      alert("Failed to submit pet listing");
    } finally {
      setSubmitting(false);
    }
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
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file))
      );
      setFormData(prev => ({
        ...prev, 
        gallery: [...prev.gallery, ...compressedImages].slice(0, 5)
      }));
    } catch (err) {
      alert("Error processing images.");
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      // When type changes, we MUST reset breed to a valid one for that type
      setFormData(prev => ({ 
        ...prev, 
        type: value, 
        breed: PET_DATA[value]?.breeds[0] || "Other" 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display">List a Pet</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Buddy" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Animal Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-brand-600">
              {Object.keys(PET_DATA).map(key => (
                <option key={key} value={key}>{PET_DATA[key].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Breed</label>
            <select name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              {PET_DATA[formData.type]?.breeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="Male">Male (ذكر)</option>
              <option value="Female">Female (أنثى)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Bracket</label>
            <select name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="0-6 months">0-6 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3+ years">3+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="0 for adoption" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="City, State" />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Pet Features & Traits</label>
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

        {/* Contact & Images */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">Media Assets</label>
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
                <p className="text-[10px] text-gray-400 mt-2">This image appears on the main marketplace cards.</p>
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
                <p className="text-[10px] text-gray-400 mt-2">Add more angles! These will appear in the photo slider.</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[120px]" placeholder="Tell us about the pet..."></textarea>
        </div>

        <button disabled={submitting} type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/30 disabled:opacity-50">
          {submitting ? "Posting..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
