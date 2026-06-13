"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    className: "",
    roll: "",
    department: "",
    schoolName: "",
    phone: "",
    teacherId: "",
    qualification: "",
    studentId: "",
  });

  useEffect(() => {
    const idParam = searchParams.get("userId");
    if (idParam) {
      setUserId(idParam);
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/complete-profile", {
        userId,
        role,
        profileData: formData,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Profile Submit failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-slate-800 to-black text-white p-4">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Complete Profile</h2>
        <p className="text-gray-400 text-center text-sm mb-6">Please provide your role and information to activate your account</p>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Please select your role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="STUDENT">Student (Student)</option>
              <option value="TEACHER">Teacher (Teacher)</option>
              <option value="GUARDIAN">Guardian (Guardian)</option>
            </select>
          </div>

          {role === "STUDENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Class (Class)</label>
                <input name="className" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Roll (Roll)</label>
                <input name="roll" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Department (Department)</label>
                <input name="department" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">School/College (School/College)</label>
                <input name="schoolName" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Phone Number (Phone Number)</label>
                <input name="phone" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
            </div>
          )}

          {role === "TEACHER" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Teacher ID (Teacher ID)</label>
                <input name="teacherId" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Department (Department)</label>
                <input name="department" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Educational Qualification (Educational Qualification)</label>
                <input name="qualification" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
              </div>
            </div>
          )}

          {role === "GUARDIAN" && (
            <div>
              <label className="block text-xs uppercase font-bold text-gray-300 mb-1">Student ID (Student ID)</label>
              <input name="studentId" type="text" onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" required />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? "Loading..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}