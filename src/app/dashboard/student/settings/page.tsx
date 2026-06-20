"use client";
import { Settings, ShieldAlert, User, Bell, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Account Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your profile, security preferences, and notification settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <button className="w-full text-left px-5 py-4 bg-slate-900/50 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold flex items-center gap-3 shadow">
            <User size={18} /> Profile Details
          </button>
          <button className="w-full text-left px-5 py-4 bg-slate-900/30 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-semibold flex items-center gap-3 transition">
            <Lock size={18} /> Security & Password
          </button>
          <button className="w-full text-left px-5 py-4 bg-slate-900/30 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl font-semibold flex items-center gap-3 transition">
            <Bell size={18} /> Notifications
          </button>
        </div>

        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
          <div className="text-center py-12">
            <ShieldAlert className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-300">Settings Module Coming Soon</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
              We are currently revamping the settings interface to give you more control over your account. Check back later for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
