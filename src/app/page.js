"use client";

import Link from "next/link";
import { ArrowRight, Search, Heart, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t, isAr } = useLanguage();
  
  const features = useMemo(() => [
    { icon: Heart, title: t('home.features.0.title'), desc: t('home.features.0.desc') },
    { icon: Shield, title: t('home.features.1.title'), desc: t('home.features.1.desc') },
    { icon: Search, title: t('home.features.2.title'), desc: t('home.features.2.desc') }
  ], [t]);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden rounded-3xl bg-brand-100/50 mt-4 px-6 text-center shadow-sm">
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            {t('home.hero_title')} <span className="text-brand-500">{t('home.hero_highlight')}</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t('home.hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pets" className="bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {t('home.btn_explore')}
            </Link>
            <Link href="/dashboard/add" className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition border border-gray-200">
              {t('home.btn_list')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={`grid md:grid-cols-3 gap-8 ${isAr ? 'rtl' : 'ltr'}`}>
        {features.map((feature, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="bg-brand-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-brand-500">
              <feature.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>
      
      {/* Monetization Proof-of-Concept: Sponsored Partners */}
      <section className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
        <div className={`flex flex-col md:flex-row justify-between items-center gap-8 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="max-w-md">
            <h2 className="text-2xl font-black text-slate-800 mb-2">{isAr ? 'رعاة PetZone' : 'PetZone Partners'}</h2>
            <p className="text-slate-500 text-sm">{isAr ? 'انضم إلى شبكة شركائنا واحصل على مساحة إعلانية تصل لآلاف المهتمين بالحيوانات الأليفة.' : 'Join our partner network and reach thousands of dedicated pet owners.'}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-help">
             <div className="font-black text-xl text-slate-400">PET FOOD CO</div>
             <div className="font-black text-xl text-slate-400">VET CARE+</div>
             <div className="font-black text-xl text-slate-400">PAW STORE</div>
          </div>
        </div>
      </section>
    </div>
  );
}
