"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { compressImage } from "@/utils/imageCompressor";
import { PET_DATA } from "@/constants/petData";

export default function EditAdPage({ params }) {
  const unwrappedParams = use(params);
  const { type, id } = unwrappedParams;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    
    async function fetchAd() {
      try {
        const docRef = doc(db, type, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user && type && id) fetchAd();
  }, [user, authLoading, type, id, router]);

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

  const handleFieldChange = (name, value) => {
    if (name === "type" && type === "pets") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        breed: PET_DATA[value]?.breeds[0] || "Other"
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const docRef = doc(db, type, id);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      alert("Ad updated successfully!");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update ad.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500" /></div>;
  if (!formData) return <div className="text-center py-20">Ad not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-brand-500 mb-6 transition">
        <ArrowLeft className="mr-2 w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
        <p className="text-gray-500 mb-8 uppercase text-xs font-bold tracking-widest">{type.slice(0, -1)} Details</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name / Title</label>
            <input 
              required 
              type="text" 
              value={formData.name || ""} 
              onChange={e => handleFieldChange('name', e.target.value)} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" 
            />
          </div>

          {type === "pets" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
                <select 
                  value={formData.type || "Dog"} 
                  onChange={e => handleFieldChange("type", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none font-bold text-brand-600"
                >
                  {Object.keys(PET_DATA).map(key => (
                    <option key={key} value={key}>{PET_DATA[key].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <select 
                  value={formData.breed || ""} 
                  onChange={e => handleFieldChange("breed", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none"
                >
                   {PET_DATA[formData.type || "Dog"]?.breeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Bracket</label>
                <select 
                  value={formData.age || "1-3 years"} 
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none"
                >
                  <option value="0-6 months">0-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  value={formData.gender || "Male"} 
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none"
                >
                  <option value="Male">Male (ذكر)</option>
                  <option value="Female">Female (أنثى)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price / Cost</label>
              <input 
                required 
                type="number" 
                value={formData.price || ""} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                required 
                type="text" 
                value={formData.location || ""} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input 
              required 
              type="tel" 
              value={formData.phone || ""} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image (Update)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="w-full bg-gray-50 p-2 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600"
            />
            {formData.image && (
              <div className="mt-4 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required 
              rows={4}
              value={formData.description || ""} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none resize-none" 
            ></textarea>
          </div>

          <button 
            disabled={submitting}
            type="submit" 
            className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {submitting ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
