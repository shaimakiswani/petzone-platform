"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Building,
  Menu,
  X,
  MessageSquare
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "User Management", icon: Users, href: "/admin/users" },
    { name: "Listings Moderation", icon: Package, href: "/admin/listings" },
    { name: "Reports Feed", icon: AlertTriangle, href: "/admin/reports" },
    { name: "Clinics & Hotels", icon: Stethoscope, href: "/admin/services" },
    { name: "Support Inbox", icon: MessageSquare, href: "/admin/support" },
  ];

  return (
    <div className="flex bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden min-h-[80vh] border border-gray-100 dark:border-slate-800 shadow-xl">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shrink-0">
            <ShieldCheck size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-black text-gray-900 dark:text-white truncate">Admin Center</h1>
              <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest">PetZone Platform</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                  isActive 
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-brand-500 transition-colors"} />
                {isSidebarOpen && <span className="text-sm font-bold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50 dark:border-slate-800">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-full flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-brand-500 transition-colors"
           >
             <ChevronRight size={20} className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
