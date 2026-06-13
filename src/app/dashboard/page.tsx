"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">RAS Academic Point Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome, {user.name} ({user.role})</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Logout
          </button>
        </div>

        <div className="border border-white/10 rounded-xl p-6 bg-black/30">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Account Profile Data</h2>
          <pre className="bg-black/50 p-4 rounded-lg text-sm text-emerald-400 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}