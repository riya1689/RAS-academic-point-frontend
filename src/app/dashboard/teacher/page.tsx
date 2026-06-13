"use client"; // ক্লায়েন্ট সাইড রেন্ডারিং নির্দেশ করছে
import { useEffect, useState } from "react"; // রিঅ্যাক্ট হুকসমূহ আমদানী করা হচ্ছে
import Link from "next/link"; // নেক্সট লিংক কম্পোনেন্ট আমদানী করা হচ্ছে
import { toast } from "react-hot-toast"; // টোস্ট নোটিফিকেশন লাইব্রেরি আমদানী
import { Plus, Copy, BookOpen, Users, ArrowRight } from "lucide-react"; // প্রয়োজনী লুসিড আইকনসমূহ আমদানী
import { createClassroom, getTeacherClassrooms } from "../../../lib/classroom.api"; // ক্লাসরুম এপিআই মেথডসমূহ আমদানী
export default function TeacherDashboard() { // শিক্ষক ড্যাশবোর্ড কম্পোনেন্টের মূল ডিক্লারেশন
  const [classrooms, setClassrooms] = useState<any[]>([]); // ক্লাসরুম লিস্ট সংরক্ষণের স্টেট
  const [isLoading, setIsLoading] = useState(true); // ডাটা লোডিং স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false); // নতুন ক্লাস তৈরির মডাল স্টেট
  const [newClassTitle, setNewClassTitle] = useState(""); // নতুন ক্লাসের নামের ইনপুট স্টেট
  const [isSubmitting, setIsSubmitting] = useState(false); // ক্লাস সাবমিট লোডিং স্টেট
  const fetchClassrooms = async () => { // ক্লাসরুম ডাটাবেজ থেকে লোড করার অ্যাসিনক্রোনাস ফাংশন
    try { // ট্রাই ব্লক শুরু
      const data = await getTeacherClassrooms(); // এপিআই কল করে শিক্ষকের ক্লাসরুমের ডাটা আনা হচ্ছে
      setClassrooms(data.classrooms || []); // স্টেট এ ক্লাসরুমের ডাটা সেট করা হচ্ছে
    } catch (error: any) { // কোনো ত্রুটি হলে ক্যাচ ব্লকে আসবে
      toast.error(error.response?.data?.message || "Failed to load classrooms"); // টোস্ট নোটিফিকেশনে এরর মেসেজ প্রদর্শন
    } finally { // সবশেষে লোডিং স্টেট মিথ্যা করা হচ্ছে
      setIsLoading(false); // লোডিং স্টেট ফলস
    } // ট্রাই-ক্যাচ-ফাইনালি সমাপ্ত
  }; // ফাংশন শেষ
  useEffect(() => { // কম্পোনেন্ট মাউন্ট হলে রান হওয়া ইফেক্ট
    fetchClassrooms(); // ক্লাসরুম লিস্ট লোড করা হচ্ছে
  }, []); // ডিপেন্ডেন্সি অ্যারে খালি রাখা হয়েছে
  const handleCreateClassroom = async (e: React.FormEvent) => { // নতুন ক্লাসরুম সাবমিট হ্যান্ডলার
    e.preventDefault(); // ফরমের ডিফল্ট অ্যাকশন বা সাবমিশন বন্ধ করা হচ্ছে
    if (!newClassTitle.trim()) { // যদি ক্লাসের নাম ফাঁকা থাকে
      return toast.error("Please enter a classroom title"); // এরর টোস্ট পাঠানো হচ্ছে
    } // ইফ ব্লক শেষ
    try { // ট্রাই ব্লক শুরু
      setIsSubmitting(true); // সাবমিটিং স্টেট সত্য করা হচ্ছে
      await createClassroom(newClassTitle); // এপিআই কলের মাধ্যমে নতুন ক্লাসরুম তৈরি করা হচ্ছে
      toast.success("Classroom created successfully!"); // সফলতার টোস্ট বার্তা
      setNewClassTitle(""); // ইনপুট বক্স খালি করা হচ্ছে
      setIsModalOpen(false); // মডাল বন্ধ করা হচ্ছে
      fetchClassrooms(); // ক্লাসরুমের তালিকা রিফ্রেশ করা হচ্ছে
    } catch (error: any) { // এরর হ্যান্ডলিং ক্যাচ ব্লক
      toast.error(error.response?.data?.message || "Failed to create classroom"); // এরর টোস্ট পাঠানো হচ্ছে
    } finally { // সবশেষে লোডিং স্টেট আপডেট করা হচ্ছে
      setIsSubmitting(false); // সাবমিটিং স্টেট মিথ্যা করা হচ্ছে
    } // // ট্রাই-ক্যাচ ব্লক শেষ
  }; // ক্রিয়েট ক্লাস ফাংশন শেষ
  const copyCode = (code: string) => { // ক্লাস কোড কপি করার হেল্পার ফাংশন
    navigator.clipboard.writeText(code); // ব্রাউজারের ক্লিপবোর্ডে কপি করা হচ্ছে
    toast.success(`Classroom code ${code} copied!`); // কপি সফল হবার নোটিফিকেশন প্রদর্শন
  }; // কপি ফাংশন শেষ
  return ( // ইউজার ইন্টারফেস রিটার্ন করা হচ্ছে
    <div className="space-y-8"> // মূল কন্টেইনার
      <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md"> // হেডার কার্ড
        <div> // শিরোনামের বাম অংশ
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Teacher Portal</h2> // প্রধান শিরোনাম
          <p className="text-slate-400 text-sm mt-1">Manage classrooms, track student attendance, and monitor progress.</p> // বিবরণী
        </div> // বাম অংশ শেষ
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer transform hover:scale-[1.02]"> // ক্লাস তৈরির বাটন
          <Plus size={20} /> // প্লাস আইকন
          <span>Create Classroom</span> // বাটনের টেক্সট
        </button> // বাটন শেষ
      </div> // হেডার কার্ড শেষ
      {isLoading ? ( // কন্ডিশনাল রেন্ডারিং: যদি ডাটা লোড হতে থাকে
        <div className="flex justify-center items-center py-20"> // স্পিনারের কন্টেইনার
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div> // স্পিনার
        </div> // কন্টেইনার শেষ
      ) : classrooms.length === 0 ? ( // অন্যথায় যদি কোনো ক্লাসরুম না থাকে
        <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl"> // নো-ডাটা কন্টেইনার
          <BookOpen className="mx-auto text-slate-600 mb-4" size={48} /> // ক্লাসরুম আইকন
          <h3 className="text-xl font-bold text-slate-300">No Classrooms Yet</h3> // টেক্সট
          <p className="text-slate-500 text-sm mt-1 mb-6">Create a classroom to start managing attendance and students.</p> // সাব-টেক্সট
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer"> // অ্যাকশন বাটন
            <Plus size={16} /> // প্লাস আইকন
            <span>Create First Class</span> // বাটন টেক্সট
          </button> // বাটন শেষ
        </div> // নো-ডাটা শেষ
      ) : ( // যদি ক্লাসরুম থেকে থাকে তবে তা রেন্ডার করা হচ্ছে
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> // গ্রিড কন্টেইনার
          {classrooms.map((cls) => ( // ক্লাসরুম সমূহের লুপ
            <div key={cls.id} className="group relative bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-6 transition duration-200 shadow-xl flex flex-col justify-between overflow-hidden"> // ক্লাসরুমের কার্ড
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-200"></div> // গ্লো ইফেক্ট
              <div> // কার্ড কন্টেন্ট শুরু
                <div className="flex items-center justify-between mb-4"> // শিরোনাম অংশ
                  <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition duration-200 inline-block"> // আইকন র‍্যাপার
                    <BookOpen size={22} /> // ক্লাসরুম আইকন
                  </span> // আইকন র‍্যাপার শেষ
                  <div className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-300 cursor-pointer transition" onClick={() => copyCode(cls.classroomCode)}> // কোড কপি অংশ
                    <span className="font-mono">{cls.classroomCode}</span> // ক্লাস কোড
                    <Copy size={12} className="text-slate-400 group-hover:text-slate-200" /> // কপি আইকন
                  </div> // কপি অংশ শেষ
                </div> // শিরোনাম শেষ
                <h4 className="text-xl font-bold group-hover:text-emerald-400 transition duration-150 mb-2 truncate">{cls.title}</h4> // ক্লাসের নাম
                <p className="text-slate-400 text-xs flex items-center mb-6"> // ছাত্রদের সংখ্যা
                  <Users size={14} className="mr-1.5 text-emerald-500" /> // ইউজার আইকন
                  <span>{(cls.members || []).length} Students Enrolled</span> // মোট ছাত্র সংখ্যা
                </p> // স্টুডেন্ট টেক্সট শেষ
              </div> // কন্টেন্ট শেষ
              <Link href={`/dashboard/teacher/classroom/${cls.id}`} className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800/50 group-hover:bg-emerald-500 hover:!text-slate-950 text-slate-300 font-semibold rounded-xl border border-slate-700/80 group-hover:border-emerald-500 transition duration-200"> // ক্লাস পেজের লিংক বাটন
                <span>Enter Classroom</span> // বাটন টেক্সট
                <ArrowRight size={16} /> // অ্যারো আইকন
              </Link> // লিংক বাটন শেষ
            </div> // কার্ড শেষ
          ))} // লুপ শেষ
        </div> // গ্রিড শেষ
      )} // কন্ডিশনাল ব্লক শেষ
      {isModalOpen && ( // ক্লাস তৈরির মডাল ওপেন হলে
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"> // মডাল ব্যাকড্রপ
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn"> // মডাল বডি
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div> // ডেকোরেটিভ গ্লো
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Create Classroom</h3> // মডাল শিরোনাম
            <p className="text-slate-400 text-sm mb-6">Enter a title to create your virtual workspace for students.</p> // নির্দেশনা
            <form onSubmit={handleCreateClassroom} className="space-y-6"> // ফরম শুরু
              <div> // ইনপুট গ্রুপ
                <label className="block text-slate-300 text-sm font-semibold mb-2">Classroom Title</label> // লেবেল
                <input type="text" placeholder="e.g. Physics - Class 10 (A)" value={newClassTitle} onChange={(e) => setNewClassTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 placeholder-slate-500 transition duration-200" required disabled={isSubmitting} /> // ইনপুট বক্স
              </div> // ইনপুট গ্রুপ শেষ
              <div className="flex space-x-3"> // অ্যাকশন বাটন গ্রুপ
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer" disabled={isSubmitting}> // বাতিল বাটন
                  Cancel // বাতিল টেক্সট
                </button> // বাটন শেষ
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 cursor-pointer transform active:scale-95" disabled={isSubmitting}> // কনফার্ম বাটন
                  {isSubmitting ? "Creating..." : "Create Class"} // সাবমিট টেক্সট
                </button> // বাটন শেষ
              </div> // অ্যাকশন গ্রুপ শেষ
            </form> // ফরম শেষ
          </div> // মডাল বডি শেষ
        </div> // মডাল ব্যাকড্রপ শেষ
      )} // মডাল কন্ডিশনাল রেন্ডার শেষ
    </div> // মূল কন্টেইনার শেষ
  ); // রেন্ডার শেষ
} // কম্পোনেন্ট শেষ
