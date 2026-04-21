"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Shield, 
  UserX, 
  CheckCircle,
  Eye,
  Trash2
} from "lucide-react";
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Fetch Users Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId, currentRole) => {
    if (!confirm(`Are you sure you want to change this user's role?`)) return;
    try {
      if (currentRole === "banned") return alert("Cannot promote a banned user.");
      const newRole = currentRole === "admin" ? "user" : "admin";
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId, currentRole) => {
    if (currentRole === "banned") {
      if (!confirm("This user is already banned. Unban them?")) return;
      try {
        await updateDoc(doc(db, "users", userId), { role: "user" });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "user" } : u));
        return;
      } catch (err) {
         return alert("Failed to unban user.");
      }
    }

    if (!confirm("This will BAN the user, preventing them from logging in. Continue?")) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: "banned" });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "banned" } : u));
    } catch (err) {
      alert("Failed to ban user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-brand-500" /> User Management
          </h1>
          <p className="text-gray-500 mt-1">Audit, moderate, and manage platform participants.</p>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-50 dark:focus:ring-brand-900/10 focus:border-brand-300 transition-all font-medium text-sm"
          />
        </div>
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none font-bold text-sm text-gray-600 dark:text-slate-400"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Regular Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-8 bg-gray-50/30"></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium">No users found matching your criteria.</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 font-black text-xs border border-brand-100">
                        {u.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                      u.role === 'admin' 
                        ? 'bg-amber-500 text-white border-amber-400' 
                        : u.role === 'banned'
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 font-medium">{new Date(u.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleAdmin(u.id, u.role)}
                        title={u.role === 'admin' ? "Revoke Admin" : "Promote to Admin"}
                        className={`p-2 rounded-xl transition-all ${
                          u.role === 'admin' 
                            ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white shadow-amber-200/50' 
                            : 'bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white shadow-blue-200/50'
                        } border border-transparent shadow-sm`}
                      >
                        <Shield size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.role)}
                        title={u.role === 'banned' ? "Unban User" : "Ban User"}
                        className={`p-2 rounded-xl transition-all border border-transparent shadow-sm ${
                          u.role === 'banned' 
                            ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' 
                            : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-red-200/50'
                        }`}
                      >
                        {u.role === 'banned' ? <UserX size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
