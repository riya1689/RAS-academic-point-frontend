"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-950 via-slate-900 to-black text-white flex flex-col justify-between font-sans">
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5">
        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          RAS Academic Point
        </h1>
        <Link 
          href="/login" 
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
        >
          Login
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="space-y-4">
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs uppercase font-bold tracking-widest">
              Education Management System
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              Manage your academic activities easily
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
              A comprehensive platform for students, teachers, and guardians. Track classes, attendance, and results in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-4">
            <Link 
              href="/student/signup"
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] group"
            >
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-xl mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                Student
              </div>
              <h3 className="font-bold text-lg mb-1">Student Portal</h3>
              <p className="text-xs text-gray-500">Sign up as a student here</p>
            </Link>

            <Link 
              href="/teacher/signup"
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] group"
            >
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-xl mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                Teacher
              </div>
              <h3 className="font-bold text-lg mb-1">Teacher Portal</h3>
              <p className="text-xs text-gray-500">Sign up as a teacher here</p>
            </Link>

            <Link 
              href="/guardian/signup"
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] group"
            >
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 flex items-center justify-center rounded-xl mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all">
                Guardian
              </div>
              <h3 className="font-bold text-lg mb-1">Guardian Portal</h3>
              <p className="text-xs text-gray-500">Sign up as a guardian here</p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-gray-600 border-t border-white/5">
        &copy; {new Date().getFullYear()} RAS Academic Point. All rights reserved |Developed by Riya Das Software Engineer.
      </footer>
    </div>
  );
}