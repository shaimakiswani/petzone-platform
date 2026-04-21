"use client";

import { useState } from "react";
import { 
  Settings, 
  FolderTree, 
  ShieldAlert, 
  Save, 
  Plus, 
  Trash2,
  CheckCircle2
} from "lucide-react";

export default function CategoriesAndRules() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock data for categories handling
  const [categories, setCategories] = useState([
    { id: 1, name: "Dogs", active: true },
    { id: 2, name: "Cats", active: true },
    { id: 3, name: "Birds", active: true },
    { id: 4, name: "Fish", active: true },
    { id: 5, name: "Rabbit", active: true },
  ]);

  const [platformRules, setPlatformRules] = useState(
    "1. Be respectful to all members.\n2. Do not sell prohibited or illegal animals.\n3. Ensure all clinic information is accurate and verified.\n4. No spamming or duplicate listings."
  );

  const toggleCategory = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="text-brand-500" /> Categories & Rules
          </h1>
          <p className="text-gray-500 mt-1">Configure platform settings and community guidelines.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-black text-sm rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-70"
        >
          {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {loading ? "Saving..." : saved ? "Saved Successfully!" : "Save Changes"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Categories Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <FolderTree className="text-blue-500" /> Active Categories
              </h2>
           </div>
           
           <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Toggle categories to control what types of pets users can list. Disabling a category hides it from the "Add Pet" form.
              </p>
           </div>

           <div className="space-y-3">
             {categories.map(cat => (
               <div key={cat.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                 <span className="font-bold text-gray-800 dark:text-white">{cat.name}</span>
                 <button 
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${cat.active ? 'bg-brand-500' : 'bg-gray-300 dark:bg-slate-700'}`}
                 >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${cat.active ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
               </div>
             ))}
           </div>
           
           <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-bold rounded-2xl flex justify-center items-center gap-2 hover:border-brand-300 hover:text-brand-500 transition-colors">
              <Plus size={20} /> Add Custom Category
           </button>
        </div>

        {/* Global Rules Section */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="text-amber-500" /> Community Rules
              </h2>
           </div>

           <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl p-4 mb-6">
              <p className="text-sm font-bold">
                These rules are displayed to users before they post an ad or send a message.
              </p>
           </div>

           <textarea 
             value={platformRules}
             onChange={(e) => setPlatformRules(e.target.value)}
             className="w-full h-80 p-6 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/20 text-sm font-medium leading-relaxed resize-none"
           />
        </div>
      </div>
    </div>
  );
}
