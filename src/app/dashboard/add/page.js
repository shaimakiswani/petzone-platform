"use client";

import Link from "next/link";
import { PawPrint, ShoppingBag, PlusCircle, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const categories = [
    { title: "List a Pet", icon: PawPrint, href: "/dashboard/add/pet", color: "bg-brand-50 text-brand-500", desc: "For adoption or selling" },
    { title: "Sell Supplies", icon: ShoppingBag, href: "/dashboard/add/supply", color: "bg-orange-50 text-orange-500", desc: "Food, toys, accessories" },
    { title: "Add Clinic", icon: PlusCircle, href: "/dashboard/add/clinic", color: "bg-blue-50 text-blue-500", desc: "Veterinary services" },
    { title: "Hostels", icon: Home, href: "/dashboard/add/hostel", color: "bg-purple-50 text-purple-500", desc: "Pet sitting and housing" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What would you like to post?</h1>
        <p className="text-gray-500">Choose a category to start building your listing</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <Link key={i} href={cat.href} className="flex items-center gap-6 p-6 bg-white border border-gray-100 shadow-sm rounded-3xl hover:shadow-md hover:border-brand-100 transition group">
            <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition shrink-0`}>
              <cat.icon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{cat.title}</h3>
              <p className="text-gray-500 text-sm">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
