"use client";

import Link from "next/link";
import { PawPrint, ShoppingBag, PlusCircle, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function AddHubPage() {
  const { user, loading } = useAuth();
  const { t, isAr } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const categories = useMemo(() => [
    { title: t('forms.pet.title'), icon: PawPrint, href: "/dashboard/add/pet", color: "bg-brand-50 text-brand-500", desc: t('home.hero_desc') },
    { title: t('forms.supply.title'), icon: ShoppingBag, href: "/dashboard/add/supply", color: "bg-orange-50 text-orange-500", desc: t('details.std_supply') },
    { title: t('nav_links.clinics'), icon: PlusCircle, href: "/dashboard/add/clinic", color: "bg-blue-50 text-blue-500", desc: t('details.std_clinic') },
    { title: t('nav_links.hostels'), icon: Home, href: "/dashboard/add/hostel", color: "bg-purple-50 text-purple-500", desc: t('details.std_services') },
  ], [t]);

  if (loading || !user) return <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>;

  return (
    <div className={`max-w-3xl mx-auto py-8 ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="mb-10 text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('forms.post_ad_title')}</h1>
        <p className="text-gray-500">{isAr ? "اختر الفئة المناسبة لإعلانك الجديد" : "Choose a category to start building your listing"}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 px-4">
        {categories.map((cat, i) => (
          <Link key={i} href={cat.href} className="flex items-center gap-6 p-6 bg-white border border-gray-100 shadow-sm rounded-3xl hover:shadow-md hover:border-brand-100 transition group">
            <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition shrink-0`}>
              <cat.icon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{cat.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
