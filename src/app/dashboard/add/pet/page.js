"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/imageCompressor";
import { PET_DATA } from "@/constants/petData";
import { X as CloseIcon, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AddPetPage() {
  const { user, loading } = useAuth();
  const { t, isAr } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    breed: "German Shepherd",
    age: "0-6 months",
    price: 0,
    isAdoption: false,
    location: "",
    phone: "",
    image: "",
    gallery: [],
    gender: "Male",
    description: "",
  });

  const [features, setFeatures] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const FEATURE_OPTIONS = useMemo(() => [
    { id: "Vaccinated", label: t('forms.pet.traits.vaccinated') },
    { id: "House Trained", label: t('forms.pet.traits.trained') },
    { id: "Microchipped", label: t('forms.pet.traits.microchipped') },
    { id: "Friendly with Kids", label: t('forms.pet.traits.friendly') },
    { id: "Neutered", label: t('forms.pet.traits.neutered') },
  ], [t]);

  const toggleFeature = (featureId) => {
    setFeatures(prev => prev.includes(featureId) ? prev.filter(f => f !== featureId) : [...prev, featureId]);
  };

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.image) return alert(t('forms.error_image'));

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
      alert(t('forms.success_pet'));
      router.push("/pets");
    } catch (err) {
      console.error(err);
      alert(t('forms.error_submit'));
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
    <div className={`max-w-2xl mx-auto py-8 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display text-center">{t('forms.pet.title')}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('forms.pet.name')}</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Buddy" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('forms.pet.type')}</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-brand-600">
              {Object.keys(PET_DATA).map(key => (
                <option key={key} value={key}>
                  {isAr ? PET_DATA[key].label.split('(')[1].replace(')', '') : key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('forms.pet.breed')}</label>
            <select name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              {PET_DATA[formData.type]?.breeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.pet.gender')}</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="Male">{t('forms.pet.genders.male')}</option>
              <option value="Female">{t('forms.pet.genders.female')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.pet.age')}</label>
            <select name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400">
              {t('forms.pet.ages').map((age, i) => (
                <option key={i} value={formData.age === age ? formData.age : ["0-6 months", "6-12 months", "1-3 years", "3+ years"][i]}>
                  {age}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
             <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Heart className={`shrink-0 ${formData.isAdoption ? 'text-emerald-500 fill-emerald-500' : 'text-gray-300'}`} size={24} />
                <div className="flex-1">
                   <h4 className="text-sm font-black text-emerald-900">{isAr ? 'هذا الأليف للتبني؟' : 'Is this pet for adoption?'}</h4>
                   <p className="text-[10px] text-emerald-600 opacity-80">{isAr ? 'عند التفعيل، سيظهر الإعلان كطلب تبني مجاني.' : 'When enabled, the listing will show as free for adoption.'}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isAdoption: !prev.isAdoption, price: !prev.isAdoption ? 0 : prev.price }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAdoption ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isAdoption ? (isAr ? '-translate-x-7' : 'translate-x-7') : (isAr ? '-translate-x-1' : 'translate-x-1')}`} />
                </button>
             </div>
          </div>

          {!formData.isAdoption && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.pet.price')}</label>
              <input required type="number" min="1" name="price" value={formData.price || ""} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder={t('forms.pet.price_placeholder')} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.pet.location')}</label>
            <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder={t('forms.pet.location_placeholder')} />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('forms.pet.phone')}</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-brand-600" placeholder="07XXXXXXXX" />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">{t('forms.pet.features')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURE_OPTIONS.map(feature => (
              <button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                className={`flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  features.includes(feature.id)
                    ? "bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "bg-white border-gray-200 text-gray-600 hover:border-brand-200"
                }`}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">{t('forms.pet.media')}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-50/50 p-5 rounded-3xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition group relative">
              <label className="block text-xs font-black text-brand-600 uppercase mb-3 tracking-widest">{t('forms.pet.cover')}</label>
              <input 
                required={!formData.image}
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">{t('forms.pet.cover_desc')}</p>
              {formData.image && (
                <div className="mt-4 relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg animate-in zoom-in duration-300">
                  <img src={formData.image} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-slate-200 hover:border-slate-400 transition group relative">
              <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">{t('forms.pet.gallery')}</label>
              <input 
                type="file" 
                multiple
                accept="image/*" 
                onChange={handleGalleryUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">{t('forms.pet.gallery_desc')}</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('forms.pet.desc')}</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[120px]" placeholder={t('forms.pet.desc_placeholder')}></textarea>
        </div>

        <button disabled={submitting} type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/30 disabled:opacity-50">
          {submitting ? t('forms.posting') : t('forms.publish')}
        </button>
      </form>
    </div>
  );
}
