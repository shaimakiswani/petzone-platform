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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide support bubbles in admin
  useEffect(() => {
    const bubbles = document.querySelectorAll('.fixed.bottom-8, .fixed.bottom-6');
    bubbles.forEach(b => b.style.display = 'none');
    return () => bubbles.forEach(b => b.style.display = 'flex');
  }, [pathname]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row md:rounded-[2.5rem] md:overflow-hidden md:border border-gray-100 dark:border-slate-800 shadow-xl">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="font-black text-sm dark:text-white">Admin Center</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-500"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed inset-0 z-[55] bg-white dark:bg-slate-900 md:relative md:flex md:translate-x-0 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarOpen ? 'md:w-64' : 'md:w-20'} 
        border-r border-gray-100 dark:border-slate-800 flex-col
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
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

        <nav className="flex-1 px-4 py-8 md:py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 md:py-3 rounded-2xl transition-all group ${
                  isActive 
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-brand-500 transition-colors"} />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm font-bold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50 dark:border-slate-800 hidden md:block">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-full flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-brand-500 transition-colors"
           >
             <ChevronRight size={20} className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
