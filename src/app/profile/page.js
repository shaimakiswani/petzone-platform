"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import PetCard from "@/components/PetCard";
import { LogOut, User, Settings, Package, Trash2, Shield, Moon, Sun, Bell, Camera } from "lucide-react";

import ChatSystem from "@/components/ChatSystem";

function ProfileContent() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  
  const [myAds, setMyAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [activeTab, setActiveTab] = useState(queryTab || "ads"); // ads, messages, settings
  const [displayName, setDisplayName] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (queryTab) setActiveTab(queryTab);
  }, [queryTab]);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    // Check system preference or local storage for dark mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [user]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Password reset email sent!");
    } catch (err) {
      alert("Error sending email.");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function fetchMyAds() {
      if (!user) return;
      try {
        const collections = ["pets", "clinics", "hostels", "supplies"];
        const allData = [];

        await Promise.all(collections.map(async (colName) => {
          const q = query(
            collection(db, colName), 
            where("userId", "==", user.uid)
          );
          const snapshot = await getDocs(q);
          snapshot.docs.forEach(doc => {
            allData.push({ id: doc.id, ...doc.data(), type: colName });
          });
        }));

        // Sort by date manually
        allData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyAds(allData);
      } catch (err) {
        console.error("Error fetching my ads:", err);
      } finally {
        setLoadingAds(false);
      }
    }

    if (user) fetchMyAds();
  }, [user, authLoading, router]);

  const handleDelete = async (adId, type) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, type, adId));
      setMyAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (err) {
      console.error("Error deleting ad:", err);
      alert("Failed to delete ad.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !user) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      
      {/* Sidebar Profile Info */}
      <div className="w-full md:w-80 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 shrink-0">
        <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6 mb-6">
          <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 mb-4">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Hi, {user.displayName || user.email?.split("@")[0]}!</h2>
          <p className="text-gray-400 text-xs">{user.email}</p>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab("ads")}
            className={`flex items-center gap-3 w-full p-3 text-left rounded-xl font-medium transition ${activeTab === 'ads' ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            <Package size={20} /> My Ads
          </button>
          <button 
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-3 w-full p-3 text-left rounded-xl font-medium transition ${activeTab === 'messages' ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            <Bell size={20} /> Messages
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 w-full p-3 text-left rounded-xl font-medium transition ${activeTab === 'settings' ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            <Settings size={20} /> Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-left hover:bg-red-50 text-red-600 rounded-xl font-medium transition mt-4"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        {activeTab === "ads" ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Listings ({myAds.length})</h1>
              <button onClick={() => router.push('/dashboard/add')} className="bg-gray-50 hover:bg-brand-50 hover:text-brand-600 text-gray-700 font-bold px-4 py-2 rounded-xl transition">
                + Post New
              </button>
            </div>

            {loadingAds ? (
               <div className="text-center py-10 text-gray-500">Loading your posts...</div>
            ) : myAds.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl block mb-2">📦</span>
                <p className="text-gray-500 font-medium">You haven't posted any listings yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {myAds.map(ad => (
                  <div key={ad.id} className="relative group">
                    <PetCard pet={ad} type={ad.type} />
                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                      <button 
                        onClick={() => handleDelete(ad.id, ad.type)}
                        className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 text-white transition backdrop-blur-sm shadow-sm"
                        title="Delete Ad"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => router.push(`/dashboard/edit/${ad.type}/${ad.id}`)}
                        className="p-2 bg-brand-500/80 rounded-full hover:bg-brand-600 text-white transition backdrop-blur-sm shadow-sm"
                        title="Edit Ad"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "messages" ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
             <ChatSystem />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="text-brand-500" /> Account Settings
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 outline-none" 
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      disabled
                      type="email" 
                      value={user.email}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed for security reasons.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    disabled={updating}
                    type="submit"
                    className="bg-brand-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-600 transition shadow-md shadow-brand-500/20"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="text-green-500" size={20} /> Security
                </h3>
                <p className="text-sm text-gray-500 mb-6">Changing your password regularly improves account safety.</p>
                <button 
                  onClick={handlePasswordReset}
                  className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition border border-gray-100"
                >
                  Send Password Reset Link
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Moon className="text-purple-500" size={20} /> Expert Features
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                      <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-brand-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl opacity-60">
                    <div className="flex items-center gap-3">
                      <Bell size={18} />
                      <span className="text-sm font-medium text-gray-700">New Ad Notifications</span>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                       <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter(); // Required for ProfileContent redirection logic, though it can stay in Content too
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading your space...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
