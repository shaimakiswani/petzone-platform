"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { compressImage } from "@/utils/imageCompressor";
import { X as CloseIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AddHostelPage() {
  const { user } = useAuth();
  const { t, isAr } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({ 
    name: "", 
    category: "hostel",
    location: "", 
    price: "", 
    phone: "", 
    image: "", 
    gallery: [],
    description: "" 
  });

  const [features, setFeatures] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const FEATURE_OPTIONS = useMemo(() => {
    if (formData.category === 'sitter') {
      return [
        { id: "Obedience", label: isAr ? 'تدريب طاعة' : 'Obedience Training' },
        { id: "Potty", label: isAr ? 'تدريب حمام' : 'Potty Training' },
        { id: "Behavioral", label: isAr ? 'تقويم سلوك' : 'Behavioral Therapy' },
        { id: "Home Visits", label: isAr ? 'زيارات منزلية' : 'Home Visits' },
        { id: "Walking", label: isAr ? 'تمشية' : 'Dog Walking' },
        { id: "Boarding", label: isAr ? 'استضافة' : 'Boarding' },
      ];
    }
    return [
      { id: "WiFi", label: t('forms.hostel.srvs.wifi') },
      { id: "AC", label: t('forms.hostel.srvs.ac') },
      { id: "24/7 Security", label: t('forms.hostel.srvs.security') },
      { id: "Medical Support", label: t('forms.hostel.srvs.medical') },
      { id: "Outdoor Area", label: t('forms.hostel.srvs.outdoor') },
      { id: "Grooming", label: t('forms.hostel.srvs.grooming') },
    ];
  }, [t, formData.category, isAr]);

  const toggleFeature = (featureId) => {
    setFeatures(prev => prev.includes(featureId) ? prev.filter(f => f !== featureId) : [...prev, featureId]);
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
    if (!formData.image) return alert(t('forms.error_image'));
    setSubmitting(true);
    try {
      await addDoc(collection(db, "hostels"), {
        ...formData,
        features: features,
        price: Number(formData.price),
        userId: user.uid,
        userDisplayName: user.displayName || user.email.split("@")[0],
        createdAt: new Date().toISOString()
      });
      alert(t('forms.success_hostel'));
      router.push("/hostels");
    } catch (err) { alert(t('forms.error_submit')); } finally { setSubmitting(false); }
  };

  if (!user) return null;

  return (
    <div className={`max-w-2xl mx-auto py-8 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 font-display text-center">
        {formData.category === 'sitter' ? (isAr ? 'إضافة مدرب حيوانات' : 'List a Pet Trainer') : t('forms.hostel.title')}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.category === 'sitter' ? (isAr ? 'اسم المدرب' : 'Trainer Name') : t('forms.hostel.name')}
            </label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{isAr ? 'الفئة' : 'Category'}</label>
            <div className={`grid grid-cols-2 gap-2`}>
              <button
                type="button"
                onClick={() => { setFormData({...formData, category: 'hostel'}); setFeatures([]); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                  formData.category === 'hostel' 
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-brand-200'
                }`}
              >
                🏠 {t('categories.hostel')}
              </button>
              <button
                type="button"
                onClick={() => { setFormData({...formData, category: 'sitter'}); setFeatures([]); }}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                  formData.category === 'sitter' 
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-brand-200'
                }`}
              >
                🦮 {t('categories.sitter')}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">{t('forms.hostel.loc')}</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" placeholder={isAr ? "المدينة، المنطقة" : "City, Area"} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.category === 'sitter' ? (isAr ? 'سعر الجلسة (JOD)' : 'Price per Session (JOD)') : t('forms.hostel.price')}
            </label>
            <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('forms.hostel.phone')}</label>
            <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none font-bold text-brand-600" placeholder="07XXXXXXXX" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
             {formData.category === 'sitter' ? (isAr ? 'خدمات التدريب' : 'Training Services') : t('forms.hostel.features')}
          </label>
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

        <div>
           <label className="block text-sm font-medium mb-1">{t('forms.hostel.desc')}</label>
           <textarea 
             required 
             rows={4}
             value={formData.description} 
             onChange={e => setFormData({...formData, description: e.target.value})} 
             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-400 outline-none"
             placeholder={t('forms.hostel.desc_placeholder')}
           ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">{t('forms.hostel.media')}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-50/50 p-5 rounded-3xl border-2 border-dashed border-brand-200 hover:border-brand-400 transition group relative">
              <label className="block text-xs font-black text-brand-600 uppercase mb-3 tracking-widest">{t('forms.hostel.cover')}</label>
              <input 
                required={!formData.image}
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">{t('forms.hostel.cover_desc')}</p>
              {formData.image && (
                <div className="mt-4 relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg animate-in zoom-in duration-300">
                  <img src={formData.image} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-slate-200 hover:border-slate-400 transition group relative">
              <label className="block text-xs font-black text-slate-500 uppercase mb-3 tracking-widest">{t('forms.hostel.gallery')}</label>
              <input 
                type="file" 
                multiple
                accept="image/*" 
                onChange={handleGalleryUpload} 
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 cursor-pointer" 
              />
              <p className="text-[10px] text-gray-400 mt-2">{t('forms.hostel.gallery_desc')}</p>
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
        <button disabled={submitting} type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/30">
          {submitting ? t('forms.posting') : t('forms.publish')}
        </button>
      </form>
    </div>
  );
}
