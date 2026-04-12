"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PawPrint, Heart, User, Search, ShoppingBag, PlusCircle, Menu, X as CloseIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const links = [
    { href: "/pets", label: "Pets" },
    { href: "/supplies", label: "Supplies" },
    { href: "/clinics", label: "Clinics" },
    { href: "/hostels", label: "Hostels" },
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            {isMenuOpen ? <CloseIcon /> : <Menu />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-brand-500 hover:text-brand-600 transition">
            <PawPrint className="w-8 h-8 fill-brand-100" />
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">PetZone</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? "text-brand-500 font-bold" : "text-gray-600 dark:text-slate-400 hover:text-brand-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative max-w-xs w-full ml-4">
            <Search className="absolute left-3 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search anything..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-100 bg-gray-50 dark:bg-slate-800 focus:bg-white transition"
            />
          </form>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link href="/dashboard/add" className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-sm font-medium">
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Post Ad</span>
            </Link>
            
            {user ? (
              <Link href="/profile" className="bg-brand-50 dark:bg-brand-900/30 px-3 sm:px-4 py-2 rounded-full text-brand-600 dark:text-brand-400 font-medium text-sm hover:bg-brand-100 transition flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden xs:inline">Profile</span>
              </Link>
            ) : (
              <Link href="/login" className="bg-brand-50 dark:bg-brand-900/30 px-3 sm:px-4 py-2 rounded-full text-brand-600 dark:text-brand-400 font-medium text-sm hover:bg-brand-100 transition flex items-center gap-2">
                <User className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-4 mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-400"
              />
            </form>
            {links.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  pathname === link.href ? "bg-brand-50 text-brand-500" : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
