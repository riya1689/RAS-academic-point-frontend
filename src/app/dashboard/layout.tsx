"use client"; // ক্লায়েন্ট সাইড রেন্ডারিং নির্দেশ করছে
import { useEffect, useState } from "react"; // রিঅ্যাক্ট হুকসমূহ আমদানী করা হচ্ছে
import { useRouter, usePathname } from "next/navigation"; // নেক্সট জেএস নেভিগেশন হুক আমদানী
import { Toaster } from "react-hot-toast"; // টোস্ট নোটিফিকেশন প্রোভাইডার আমদানী
import { BookOpen, LogOut, User as UserIcon, Home, Menu, X } from "lucide-react"; // লুসিড আইকনসমূহ আমদানী করা হচ্ছে
export default function DashboardLayout({ children }: { children: React.ReactNode }) { // লেআউট কম্পোনেন্টের মূল ডিক্লারেশন
  const router = useRouter(); // রাউটার ইনস্ট্যান্স তৈরি করা হচ্ছে
  const pathname = usePathname(); // বর্তমান ইউআরএল পাথ জানার জন্য পাথনেম হুক
  const [user, setUser] = useState<any>(null); // ইউজারের স্টেট ডিফাইন করা হচ্ছে
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // মোবাইল সাইডবারের খোলা/বন্ধ স্টেট
  useEffect(() => { // ইউজার লগইন এবং সেশন ভ্যালিডেশন চেক করার হুক
    const token = localStorage.getItem("token"); // ব্রাউজার লোকাল স্টোরেজ থেকে টোকেন নেওয়া হচ্ছে
    const storedUser = localStorage.getItem("user"); // ব্রাউজার লোকাল স্টোরেজ থেকে ইউজার ডাটা নেওয়া হচ্ছে
    if (!token || !storedUser) { // যদি টোকেন অথবা ইউজার ডাটা কোনো একটি না থাকে
      router.push("/login"); // সরাসরি লগইন পেজে রিডিরেক্ট করা হচ্ছে
    } else { // অন্যথায় ইউজার স্টেট সেট করা হচ্ছে
      const parsedUser = JSON.parse(storedUser); // স্ট্রিং থেকে অবজেক্টে রূপান্তর করা হচ্ছে
      setUser(parsedUser); // ইউজারের স্টেট আপডেট করা হচ্ছে
      if (pathname === "/dashboard") { // যদি বেস ড্যাশবোর্ড পাথে ব্রাউজ করে
        if (parsedUser.role === "TEACHER") { // শিক্ষকের ক্ষেত্রে শিক্ষক ড্যাশবোর্ডে পাঠানো হচ্ছে
          router.push("/dashboard/teacher"); // শিক্ষক ড্যাশবোর্ড পেজে রিডিরেক্ট
        } else if (parsedUser.role === "STUDENT") { // ছাত্রের ক্ষেত্রে ছাত্র ড্যাশবোর্ডে পাঠানো হচ্ছে
          router.push("/dashboard/student"); // ছাত্র ড্যাশবোর্ড পেজে রিডিরেক্ট
        } else if (parsedUser.role === "GUARDIAN") { // অভিভাবকের ক্ষেত্রে অভিভাবক ড্যাশবোর্ডে পাঠানো হচ্ছে
          router.push("/dashboard/guardian"); // অভিভাবক ড্যাশবোর্ড পেজে রিডিরেক্ট
        } // রোল চেকিং ব্লক শেষ
      } // বেস পাথ চেকিং শেষ
    } // কন্ডিশনাল চেকিং শেষ
  }, [router, pathname]); // রাউটার এবং পাথনেম পরিবর্তনের সাপেক্ষে ইফেক্ট চলবে
  const handleLogout = () => { // লগআউট ফাংশন ডিফাইন করা হচ্ছে
    localStorage.removeItem("token"); // লোকাল স্টোরেজ থেকে টোকেন ডিলিট করা হচ্ছে
    localStorage.removeItem("user"); // লোকাল স্টোরেজ থেকে ইউজার ডিলিট করা হচ্ছে
    router.push("/login"); // সফলভাবে লগআউট এর পর লগইন পেজে পাঠানো হচ্ছে
  }; // লগআউট ফাংশন শেষ
  if (!user) { // ইউজার ডাটা লোড না হওয়া পর্যন্ত লোডিং স্ক্রিন দেখাবে
    return ( // লোডিং জিআইএফ বা মার্কআপ রিটার্ন
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"> // ডার্ক থিমে লোডিং কন্টেইনার
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div> // স্পিনার লোডার
      </div> // লোডিং কন্টেইনার শেষ
    ); // রিটার্ন শেষ
  } // ইফ কন্ডিশন শেষ
  return ( // মূল লেআউট রেন্ডারিং শুরু
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans"> // পুরো স্ক্রিন জুড়িয়া মেইন কন্টেইনার
      <Toaster position="top-right" toastOptions={{ style: { background: "#0f172a", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.1)" } }} /> // সুন্দর গ্লাস মরফিক নোটিফিকেশন কনফিগারেশন
      <header className="md:hidden bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center z-50"> // মোবাইলের জন্য হেডার বার
        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">RAS Academic</span> // প্রতিষ্ঠানের নাম
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-100 hover:text-emerald-400 focus:outline-none"> // মেনু টগল বাটন
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />} // কন্ডিশনাল আইকন প্রদর্শন
        </button> // বাটন শেষ
      </header> // হেডার শেষ
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out md:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 z-40`}> // রেসপন্সিভ সাইডবার
        <div className="hidden md:block mb-8"> // লোগো বা হেডিং এর অংশ
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">RAS Academic</h1> // প্রতিষ্ঠানের ব্র্যান্ডিং
          <p className="text-xs text-slate-400 mt-1">Education Portal</p> // সাবটাইটেল
        </div> // লোগো ব্লক শেষ
        <nav className="flex-1 space-y-2"> // নেভিগেশন লিংক সমূহের তালিকা
          <button onClick={() => { setIsSidebarOpen(false); router.push("/dashboard"); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 ${pathname.includes("/dashboard/teacher") || pathname.includes("/dashboard/student") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800/50 text-slate-400"}`}> // ড্যাশবোর্ড হোম লিংক বাটন
            <Home size={20} /> // হোম আইকন
            <span>Dashboard</span> // হোম লেখা
          </button> // বাটন শেষ
        </nav> // নেভিগেশন শেষ
        <div className="mt-auto pt-6 border-t border-slate-800/80 flex flex-col space-y-4"> // নিচের দিকের প্রোফাইল ও লগআউট
          <div className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-xl border border-slate-800/50"> // ইউজারের সংক্ষিপ্ত প্রোফাইল ভিউ
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"> // আইকন কন্টেইনার
              <UserIcon size={20} /> // ইউজার আইকন
            </div> // আইকন শেষ
            <div className="overflow-hidden"> // কন্টেন্ট ক্লিপিং
              <h4 className="text-sm font-semibold truncate">{user.name}</h4> // ইউজারের নাম
              <p className="text-xs text-slate-400 capitalize truncate">{user.role.toLowerCase()}</p> // ইউজারের ভূমিকা
            </div> // টেক্সট শেষ
          </div> // প্রোফাইল শেষ
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:border-rose-500/20 border border-transparent transition duration-150"> // লগআউট বাটন
            <LogOut size={20} /> // লগআউট আইকন
            <span>Log out</span> // লগআউট টেক্সট
          </button> // বাটন শেষ
        </div> // বটম সেকশন শেষ
      </aside> // সাইডবার শেষ
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full"> // মূল ড্যাশবোর্ড পেজ কন্টেন্ট এরিয়া
        {children} // পেজের ডাইনামিক কন্টেন্ট রেন্ডার করা হচ্ছে
      </main> // কন্টেন্ট এরিয়া শেষ
    </div> // মেইন কন্টেইনার শেষ
  ); // রেন্ডার শেষ
} // ড্যাশবোর্ড লেআউট ফাংশন শেষ
