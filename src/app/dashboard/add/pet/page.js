"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/imageCompressor";

export default function AddPetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    type: "Cat", // Default
    breed: "Persian", // Default
    age: "0-6 months", // Default
    price: "",
    location: "",
    phone: "",
    image: "",
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

    setSubmitting(true);
    try {
      await addDoc(collection(db, "pets"), {
        ...formData,
        features: features,
        userId: user.uid,
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">List a Pet</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Buddy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <select name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="Persian">Persian</option>
              <option value="Siamese">Siamese</option>
              <option value="Golden Retriever">Golden Retriever</option>
              <option value="Husky">Husky</option>
              <option value="Mixed">Mixed</option>
              <option value="Other">Other</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload (Gallery)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100" 
            />
            {formData.image && <p className="text-xs text-green-600 mt-1 mt-2">Image attached!</p>}
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
