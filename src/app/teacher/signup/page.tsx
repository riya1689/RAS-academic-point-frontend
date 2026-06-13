"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function TeacherSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [department, setDepartment] = useState("");
  const [qualification, setQualification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup/teacher", {
        email,
        password,
        name,
        teacherId,
        department,
        qualification,
      });

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Teacher signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-slate-800 to-black text-white p-4">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Teacher Registration</h2>
        <p className="text-gray-400 text-center text-sm mb-6">Create a new account as a teacher</p>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="teacher@gmail.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Dr. Muhammad Jafar"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Teacher ID</label>
            <input 
              type="text" 
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="T-2026-001"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Department</label>
            <input 
              type="text" 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Mathematics"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Qualification</label>
            <input 
              type="text" 
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="M.Sc. in Mathematics, Dhaka University"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? "Loading..." : "Complete Signup"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}