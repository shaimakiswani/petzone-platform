"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PawPrint, Heart, User, Search, ShoppingBag, PlusCircle, Menu, MessageSquare, X as CloseIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t, isAr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen for Chats
    const qChats = query(
      collection(db, "chats"),
      where("unreadBy", "array-contains", user.uid)
    );

    // Listen for System Notifications
    const qNotifs = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("isRead", "==", false)
    );

    let chatCount = 0;
    let notifCount = 0;

    const unsubscribeChats = onSnapshot(qChats, (snap) => {
      chatCount = snap.docs.length;
      setUnreadCount(chatCount + notifCount);
    });

    const unsubscribeNotifs = onSnapshot(qNotifs, (snap) => {
      notifCount = snap.docs.length;
      setUnreadCount(chatCount + notifCount);
    });

    return () => {
      unsubscribeChats();
      unsubscribeNotifs();
      setUnreadCount(0);
    };
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const links = [
    { href: "/pets", label: t('nav_links.pets') },
    { href: "/supplies", label: t('nav_links.supplies') },
    { href: "/clinics", label: t('nav_links.clinics') },
    { href: "/hostels", label: t('nav_links.hostels') },
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-brand-100/50 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center flex-row">
          
          {/* Mobile Menu Toggle & Actions (Smallest screens) */}
          <div className="flex md:hidden items-center gap-1">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              {isMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-brand-500 hover:scale-105 transition-transform">
            <PawPrint className="w-7 h-7 sm:w-8 sm:h-8 fill-brand-100" />
            <span className="font-black text-xl sm:text-2xl tracking-tighter text-gray-900 dark:text-white">PetZone</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-all relative py-1 group ${
                  pathname === link.href ? "text-brand-500" : "text-gray-500 dark:text-slate-400 hover:text-brand-400"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 transition-transform duration-300 origin-left ${pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} />
              </Link>
            ))}
          </div>

          {/* Search Form (Desktop only) */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative max-w-[200px] xl:max-w-xs w-full ml-4 group">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} group-focus-within:text-brand-500 text-gray-400 w-4 h-4 transition-colors`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('nav_search')} 
              className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/20 bg-gray-50 dark:bg-slate-800 focus:bg-white transition-all`}
            />
          </form>

          {/* Shared Header Actions */}
          <div className="flex gap-1.5 sm:gap-4 items-center">
            {/* Post Ad - Always visible for quick access as requested */}
            <Link href="/dashboard/add" className="text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 p-2 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-2 transition-all active:scale-95 group">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline font-bold text-sm tracking-tight">{t('nav_links.post_ad')}</span>
            </Link>

            {/* Messages - Always visible as requested */}
            <Link href="/profile?tab=messages" className="text-gray-500 dark:text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 p-2 sm:p-2.5 rounded-2xl relative transition-all active:scale-95">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadCount > 0 && (
                <span className={`absolute top-1.5 ${isAr ? 'left-1.5' : 'right-1.5'} bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md animate-bounce`}>
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Hidden on very small mobile, visible in menu instead */}
            <Link href="/dashboard/favorites" title="Favorites" className="hidden sm:inline-flex text-gray-500 dark:text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 p-2.5 rounded-2xl transition-all">
              <Heart className="w-6 h-6" />
            </Link>
            
            {user?.role === 'admin' && (
              <Link href="/admin" title="Admin Panel" className="bg-amber-500 text-white p-2 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            )}
            
            {user ? (
              <Link href="/profile" className="hidden sm:flex bg-brand-50 dark:bg-brand-900/30 px-4 py-2 rounded-2xl text-brand-600 dark:text-brand-400 font-bold text-xs hover:bg-brand-100 transition-all items-center gap-2 shadow-sm border border-brand-100/50">
                <User className="w-4 h-4" />
                <span className="hidden xs:inline">{t('profile_tabs.settings')}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:flex bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-brand-500 hover:text-white transition-all items-center gap-2 border border-slate-200 dark:border-slate-700">
                <User className="w-4 h-4" />
                {t('common.message')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tidy Dropdown (Non-fullscreen) */}
      {isMenuOpen && (
        <div className={`absolute top-16 ${isAr ? 'right-4' : 'left-4'} w-[280px] bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
          <div className="p-3 space-y-1">
            {/* Search integrated in menu for mobile */}
            <form onSubmit={handleSearch} className="relative mb-3 group mt-1">
              <Search className={`absolute ${isAr ? 'right-4' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('nav_search')} 
                className={`w-full ${isAr ? 'pr-11 pl-4 text-right' : 'pl-9 pr-4 text-left'} py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-100`}
              />
            </form>

            <div className="grid grid-cols-1 gap-1">
              {links.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-2xl text-sm font-black transition-all ${
                    pathname === link.href 
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20" 
                      : "text-gray-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-gray-100 dark:border-slate-800" />

              <Link 
                href="/dashboard/favorites"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Heart size={18} className="text-gray-400" />
                {t('favorites.title')}
              </Link>
              
              <Link 
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <User size={18} className="text-gray-400" />
                {user ? t('profile_tabs.settings') : t('common.message')}
              </Link>

              {user?.role === 'admin' && (
                <Link 
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 transition-all"
                >
                  <ShieldCheck size={18} />
                  Admin Control
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for closing tidy menu when clicking outside */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/5 z-[55] md:hidden cursor-default"
        />
      )}
    </nav>
  );
}
