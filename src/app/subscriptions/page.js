"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Check, Shield, Star, Rocket, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionsPage() {
  const { t, isAr } = useLanguage();
  const router = useRouter();

  const plans = [
    {
      name: isAr ? "الفئة العادية" : "Starter",
      price: "0",
      icon: <Star className="text-gray-400" />,
      features: isAr ? [
        "إضافة حتى 5 إعلانات",
        "صور بجودة عادية",
        "دعم فني عبر البريد",
      ] : [
        "Up to 5 listings",
        "Standard image quality",
        "Email support",
      ],
      color: "bg-gray-50",
      textColor: "text-gray-900",
      badge: isAr ? "مجاني" : "Free"
    },
    {
      name: isAr ? "الفئة الاحترافية" : "Pro Shop",
      price: "3",
      icon: <Shield className="text-brand-500" />,
      features: isAr ? [
        "إعلانات غير محدودة",
        "شارة التوثيق الزرقاء",
        "ظهور مميز في نتائج البحث",
        "إحصائيات متقدمة للمشاهدات",
        "دعم فني ذو أولوية",
      ] : [
        "Unlimited listings",
        "Blue Verification Badge",
        "Priority Search Placement",
        "Advanced View Analytics",
        "Priority Support",
      ],
      color: "bg-brand-500",
      textColor: "text-white",
      badge: isAr ? "الأكثر طلباً" : "Most Popular",
      isPopular: true
    },
    {
      name: isAr ? "فئة الشركات" : "Enterprise",
      price: "10",
      icon: <Rocket className="text-amber-500" />,
      features: isAr ? [
        "كل ميزات الفئة الاحترافية",
        "إعلانات ممولة تلقائياً",
        "تكامل مع متجرك الخاص",
        "مدير حساب مخصص",
      ] : [
        "All Pro Features",
        "Auto-Promoted Listings",
        "Store Integration",
        "Dedicated Account Manager",
      ],
      color: "bg-slate-900",
      textColor: "text-white",
      badge: isAr ? "للأعمال" : "Business"
    }
  ];

  return (
    <div className={`max-w-6xl mx-auto py-12 px-4 ${isAr ? 'rtl' : 'ltr'}`}>
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className={`flex items-center gap-2 mb-8 text-gray-500 hover:text-brand-500 transition-colors font-bold group ${isAr ? 'flex-row-reverse' : ''}`}
      >
        <div className={`w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-brand-50 group-hover:border-brand-100 transition-all ${isAr ? 'rotate-180' : ''}`}>
          <ArrowLeft size={20} />
        </div>
        <span>{t('common.back')}</span>
      </button>

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
          {isAr ? 'اختر الخطة التي تناسب احتياجاتك' : 'Choose the Plan That Fits You'}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          {isAr 
            ? 'ارتقِ بتجربتك في PetZone، سواء كنت تبحث عن منزل لأليفك أو تدير عيادة طبية احترافية.' 
            : 'Elevate your PetZone experience, whether you are finding a home for a pet or running a professional clinic.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className={`relative rounded-[3rem] p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${plan.isPopular ? 'ring-4 ring-brand-100 shadow-xl' : 'bg-white shadow-sm'}`}
          >
            {plan.badge && (
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.isPopular ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {plan.badge}
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50`}>
                {plan.icon}
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <h3 className="font-black text-xl text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-500">{plan.price}</span>
                  <span className="text-xs font-bold text-gray-400">JOD / {isAr ? 'شهر' : 'mo'}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feat, j) => (
                <li key={j} className={`flex items-start gap-3 text-sm font-medium text-gray-600 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <div className="w-full bg-gray-100 text-gray-400 font-black py-4 rounded-2xl text-center text-sm cursor-not-allowed">
                {isAr ? 'الدفع غير متاح حالياً' : 'Payment Coming Soon'}
              </div>
              <p className="text-[10px] text-gray-400 text-center italic">
                {isAr ? 'سيتم تفعيل الدفع الإلكتروني قريباً' : 'Online payment will be enabled soon'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-50 rounded-[3rem] p-10 text-center border border-brand-100">
         <h2 className="text-2xl font-black text-brand-600 mb-2">
           {isAr ? 'هل لديك استفسار عن الباقات؟' : 'Have Questions About Plans?'}
         </h2>
         <p className="text-brand-400 text-sm mb-6 max-w-lg mx-auto font-medium">
           {isAr 
             ? 'فريقنا جاهز لمساعدتك في اختيار الباقة الأنسب لمشروعك أو عيادتك. تواصل معنا عبر الدعم الفني.' 
             : 'Our team is ready to help you choose the best plan for your project or clinic. Reach out via support.'}
         </p>
         <button 
           onClick={() => window.dispatchEvent(new CustomEvent('openSupport', { detail: { view: 'new' } }))}
           className="bg-brand-500 text-white font-black px-10 py-4 rounded-2xl hover:bg-brand-600 transition shadow-lg shadow-brand-500/20"
         >
           {isAr ? 'تواصل مع الدعم الفني' : 'Contact Support'}
         </button>
      </div>
    </div>
  );
}
