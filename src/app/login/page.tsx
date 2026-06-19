"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");
      const classIdParam = params.get("classId");

      if (!response.data.user.role || response.data.user.role === "UNASSIGNED") {
        router.push(`/complete-profile?userId=${response.data.user.id}`);
      } else if (redirectParam === "enroll" && classIdParam) {
        router.push(`/?enroll=${classIdParam}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(
          err.response?.data?.message ||
            "Log in failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const response = await api.post("/auth/sign-in/social", {
        provider: "google",
        callbackURL: `${window.location.origin}/verify-otp`,
      });
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to initialize Google login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-slate-800 to-black text-white p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent font-sans">
          RAS Academic Point
        </h2>

        <p className="text-gray-400 text-center text-sm mb-6">
          Login
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="name@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-gray-300 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>

          <span className="relative bg-slate-800 px-3 text-xs text-gray-400">
            Or
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.57 15.01 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.97 3.08C6.18 7.69 8.85 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.32 3.48l3.6 2.79c2.1-1.94 3.31-4.79 3.31-8.37z"
            />
            <path
              fill="#FBBC05"
              d="M5.21 10.8c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.24 7.14C.45 8.74 0 10.53 0 12.43s.45 3.69 1.24 5.29l3.97-3.08c-.24-.72-.38-1.49-.38-2.29z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.79c-1-.67-2.28-1.07-3.96-1.07-3.15 0-5.82-2.65-6.79-5.76l-3.97 3.08C3.2 19.46 7.24 23 12 23z"
            />
          </svg>

          Log in with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          Create a new account:

          <div className="flex flex-wrap justify-center gap-3 mt-2 font-medium">
            <a href="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}