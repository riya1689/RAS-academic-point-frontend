"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { BookOpen, LogOut, User as UserIcon, Home, Menu, X, HelpCircle, FileText, Trophy, Calendar, Globe, Shield } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (pathname === "/dashboard") {
        if (parsedUser.role === "TEACHER") {
          router.push("/dashboard/teacher");
        } else if (parsedUser.role === "STUDENT") {
          router.push("/dashboard/student");
        } else if (parsedUser.role === "GUARDIAN") {
          router.push("/dashboard/guardian");
        } else if (parsedUser.role === "ADMIN") {
          router.push("/dashboard/admin");
        }
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: "#0f172a", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.1)" } }} />
      <header className="md:hidden bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center z-50">
        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">RAS Academic</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-100 hover:text-emerald-400 focus:outline-none">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out md:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 z-40`}>
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">RAS Academic</h1>
          <p className="text-xs text-slate-400 mt-1">Education Portal</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setIsSidebarOpen(false); router.push("/"); }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 transition duration-150">
            <Globe size={20} />
            <span>Go to Homepage</span>
          </button>
          <button onClick={() => { setIsSidebarOpen(false); router.push("/dashboard"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname.includes("/dashboard/teacher") || pathname.includes("/dashboard/student") || pathname.includes("/dashboard/guardian") || pathname === "/dashboard/admin" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}>
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          {user?.role === "ADMIN" && (
            <button onClick={() => { setIsSidebarOpen(false); router.push("/dashboard/admin"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname === "/dashboard/admin" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}>
              <Shield size={20} />
              <span>Admin Panel</span>
            </button>
          )}
          <button onClick={() => { setIsSidebarOpen(false); router.push("/dashboard/support"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname === "/dashboard/support" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}>
            <HelpCircle size={20} />
            <span>Support Sessions</span>
          </button>
          {(user?.role === "TEACHER" || user?.role === "STUDENT") && (
            <button onClick={() => { setIsSidebarOpen(false); router.push(user.role === "TEACHER" ? "/dashboard/teacher/booking" : "/dashboard/student/booking"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname.includes("/booking") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}>
              <Calendar size={20} />
              <span>1-to-1 Sessions</span>
            </button>
          )}
          <button onClick={() => { setIsSidebarOpen(false); router.push("/dashboard/results"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname === "/dashboard/results" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}>
            <FileText size={20} />
            <span>Exam Results</span>
          </button>
          <button onClick={() => { setIsSidebarOpen(false); router.push("/dashboard/leaderboard"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname === "/dashboard/leaderboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}>
            <Trophy size={20} />
            <span>Leaderboard</span>
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-800/80 flex flex-col space-y-4">
          <div className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-xl border border-slate-800/50">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 capitalize truncate">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:border-rose-500/20 border border-transparent transition duration-150">
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}