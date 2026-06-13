"use client"; // ক্লায়েন্ট সাইড রেন্ডারিং নির্দেশ করছে
import { useEffect, useState } from "react"; // রিঅ্যাক্ট হুকসমূহ আমদানী করা হচ্ছে
import { toast } from "react-hot-toast"; // টোস্ট নোটিফিকেশন লাইব্রেরি আমদানী
import { Plus, BookOpen, Calendar, CheckCircle2, XCircle, ArrowRight, User } from "lucide-react"; // প্রয়োজনী লুসিড আইকনসমূহ আমদানী
import { getStudentClassrooms, joinClassroom, getStudentAttendance } from "../../../lib/classroom.api"; // ক্লাসরুম এপিআই মেথডসমূহ আমদানী
export default function StudentDashboard() { // ছাত্র ড্যাশবোর্ড কম্পোনেন্টের মূল ডিক্লারেশন
  const [classrooms, setClassrooms] = useState<any[]>([]); // ছাত্রের যুক্ত হওয়া ক্লাসরুম তালিকা স্টেট
  const [isLoading, setIsLoading] = useState(true); // ডাটা লোডিং স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false); // ক্লাস কোড দিয়ে যোগদানের মডাল স্টেট
  const [classCode, setClassCode] = useState(""); // ক্লাস কোডের ইনপুট স্টেট
  const [isSubmitting, setIsSubmitting] = useState(false); // সাবমিটিং লোডার স্টেট
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null); // বিস্তারিত উপস্থিতি দেখার জন্য নির্বাচিত ক্লাসরুম
  const [attendanceData, setAttendanceData] = useState<any>(null); // নির্বাচিত ক্লাসের উপস্থিতি রেকর্ডের ডাটা স্টেট
  const [loadingAttendance, setLoadingAttendance] = useState(false); // উপস্থিতি লোডিং স্টেট
  const fetchClassrooms = async () => { // ক্লাসরুমের ডাটা সংগ্রহের ফাংশন
    try { // ট্রাই ব্লক শুরু
      const data = await getStudentClassrooms(); // এপিআই কল করে যুক্ত ক্লাসের তালিকা আনা হচ্ছে
      setClassrooms(data.classrooms || []); // স্টেট আপডেট
    } catch (error: any) { // এরর ক্যাচ ব্লক
      toast.error(error.response?.data?.message || "Failed to load classrooms"); // এরর টোস্ট বার্তা
    } finally { // সবশেষে লোডিং অফ করা হচ্ছে
      setIsLoading(false); // লোডিং সমাপ্ত
    } // ট্রাই-ক্যাচ শেষ
  }; // ফাংশন শেষ
  useEffect(() => { // ফার্স্ট রেন্ডার ইফেক্ট
    fetchClassrooms(); // ক্লাসরুমগুলো ফেচ করা হচ্ছে
  }, []); // খালি ডিপেন্ডেন্সি
  const handleJoinClassroom = async (e: React.FormEvent) => { // ক্লাসরুমে যোগদানের সাবমিট হ্যান্ডলার
    e.preventDefault(); // ফরমের ডিফল্ট সাবমিশন বন্ধ
    if (!classCode.trim()) { // যদি ইনপুট ফিল্ড ফাকা থাকে
      return toast.error("Please enter a classroom code"); // এরর টোস্ট
    } // If কন্ডিশন শেষ
    try { // ট্রাই ব্লক
      setIsSubmitting(true); // সাবমিটিং স্টেট সত্য করা হচ্ছে
      await joinClassroom(classCode.toUpperCase()); // কোড আপারকেস করে যোগদানের জন্য এপিআই রিকোয়েস্ট পাঠানো হচ্ছে
      toast.success("Successfully joined the classroom!"); // সফলতার টোস্ট
      setClassCode(""); // ইনপুট বক্স খালি করা হচ্ছে
      setIsModalOpen(false); // মডাল বন্ধ
      fetchClassrooms(); // রিফ্রেশ করা হচ্ছে ক্লাসরুমের তালিকা
    } catch (error: any) { // এরর ক্যাচ
      toast.error(error.response?.data?.message || "Failed to join classroom"); // এরর টোস্ট প্রদর্শন
    } finally { // লোডিং সমাপ্তি
      setIsSubmitting(false); // সাবমিটিং স্টেট মিথ্যা করা হচ্ছে
    } // ট্রাই-ক্যাচ সমাপ্তি
  }; // ফাংশন শেষ
  const handleViewAttendance = async (classroom: any) => { // উপস্থিতি রিপোর্ট দেখার ফাংশন
    setSelectedClassroom(classroom); // নির্বাচিত ক্লাসরুম সেভ করা হচ্ছে
    setLoadingAttendance(true); // উপস্থিতি ডাটা লোড স্টেট ট্রু করা হচ্ছে
    try { // ট্রাই ব্লক
      const data = await getStudentAttendance(classroom.id); // নির্দিষ্ট ক্লাসের নিজের উপস্থিতি রেকর্ড পাওয়ার এপিআই কল
      setAttendanceData(data); // উপস্থিতি ডাটা সংরক্ষণ
    } catch (error: any) { // এরর ক্যাচ
      toast.error(error.response?.data?.message || "Failed to load attendance records"); // এরর নোটিফিকেশন
    } finally { // সবশেষে লোড শেষ করা হচ্ছে
      setLoadingAttendance(false); // উপস্থিতি লোডিং ফলস
    } // ট্রাই-ক্যাচ সমাপ্তি
  }; // ফাংশন শেষ
  return ( // রিটার্ন ভিউ শুরু
    <div className="space-y-8"> // মেইন কন্টেইনার
      <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md"> // হেডার পার্ট
        <div> // বাম দিকের অংশ
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Student Portal</h2> // শিরোনাম
          <p className="text-slate-400 text-sm mt-1">Join classrooms, view class resources, and track your attendance records.</p> // বিবরণ
        </div> // বাম অংশ শেষ
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer transform hover:scale-[1.02]"> // ক্লাসরুমে যোগদানের বাটন
          <Plus size={20} /> // প্লাস আইকন
          <span>Join Classroom</span> // টেক্সট
        </button> // বাটন শেষ
      </div> // হেডার কার্ড শেষ
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> // মূল ড্যাশবোর্ড গ্রিড
        <div className="lg:col-span-2 space-y-6"> // বাম দিকের ক্লাসরুম গ্রিড কলাম
          <h3 className="text-xl font-bold text-slate-300">My Classrooms</h3> // সেকশন হেডার
          {isLoading ? ( // কন্ডিশনাল রেন্ডার: লোডিং
            <div className="flex justify-center items-center py-20"> // স্পিনার কন্টেইনার
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div> // স্পিনার
            </div> // স্পিনার কন্টেইনার শেষ
          ) : classrooms.length === 0 ? ( // অন্যথায় যদি কোনো ক্লাসরুমে যুক্ত না থাকে
            <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl"> // নো-ডাটা কন্টেইনার
              <BookOpen className="mx-auto text-slate-600 mb-4" size={48} /> // আইকন
              <h3 className="text-xl font-bold text-slate-300">No Classrooms Joined</h3> // টেক্সট
              <p className="text-slate-500 text-sm mt-1 mb-6">Enter a class code provided by your teacher to join a class.</p> // সাব-টেক্সট
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer"> // বাটন
                <Plus size={16} /> // প্লাস আইকন
                <span>Join First Class</span> // বাটন টেক্সট
              </button> // বাটন শেষ
            </div> // নো-ডাটা শেষ
          ) : ( // যদি ক্লাসরুম থাকে
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> // গ্রিড
              {classrooms.map((cls) => ( // ম্যাপ শুরু
                <div key={cls.id} className={`group bg-slate-900/50 hover:bg-slate-900/80 border transition duration-200 shadow-xl rounded-2xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer ${selectedClassroom?.id === cls.id ? "border-emerald-500" : "border-slate-800/80 hover:border-slate-700"}`} onClick={() => handleViewAttendance(cls)}> // ক্লাসের কার্ড
                  <div> // কার্ড বডি শুরু
                    <div className="flex items-center justify-between mb-4"> // কার্ডের টপ পার্ট
                      <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition duration-200 inline-block"> // আইকন র‍্যাপার
                        <BookOpen size={22} /> // ক্লাসরুম আইকন
                      </span> // আইকন র‍্যাপার শেষ
                    </div> // টপ পার্ট শেষ
                    <h4 className="text-xl font-bold text-slate-200 group-hover:text-emerald-400 transition mb-2 truncate">{cls.title}</h4> // শিরোনাম
                    <p className="text-slate-400 text-xs flex items-center mb-6"> // শিক্ষক পরিচিতি অংশ
                      <User size={14} className="mr-1.5 text-emerald-500" /> // ইউজার আইকন
                      <span>Teacher: {cls.teacher?.user?.name || "Academic Teacher"}</span> // শিক্ষক নাম
                    </p> // পরিচিতি শেষ
                  </div> // কার্ড বডি শেষ
                  <div className="w-full flex items-center justify-between py-2 text-xs font-semibold text-emerald-400"> // নিচের অংশ
                    <span>View Attendance Logs</span> // ভিউ টেক্সট
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition duration-150" /> // অ্যারো আইকন
                  </div> // নিচের অংশ শেষ
                </div> // কার্ড শেষ
              ))} // ম্যাপ শেষ
            </div> // গ্রিড শেষ
          )} // কন্ডিশনাল রেন্ডার শেষ
        </div> // বাম কলাম শেষ
        <div className="space-y-6"> // ডান কলাম - উপস্থিতি রেকর্ড প্যানেল
          <h3 className="text-xl font-bold text-slate-300">Attendance Report</h3> // সেকশন হেডার
          {!selectedClassroom ? ( // যদি কোনো ক্লাস সিলেক্ট না করা থাকে
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm"> // সিলেক্ট করুন নির্দেশক বার্তা
              Select a classroom card to check your active attendance history and performance statistics. // বার্তা টেক্সট
            </div> // বার্তা শেষ
          ) : loadingAttendance ? ( // সিলেক্ট করা হলে ও যদি লোড হতে থাকে
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"> // লোডিং বক্স
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div> // স্পিনার
              <span className="text-slate-400 text-sm">Loading attendance history...</span> // লোডিং টেক্সট
            </div> // লোডিং বক্স শেষ
          ) : ( // লোড হওয়া শেষ হলে রিপোর্ট প্রদর্শন করা হচ্ছে
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn"> // কন্টেইনার
              <div> // ক্লাসের নাম অংশ
                <h4 className="text-lg font-bold text-slate-200">{selectedClassroom.title}</h4> // ক্লাসের নাম
                <p className="text-xs text-slate-500 mt-0.5">Code: {selectedClassroom.classroomCode}</p> // ক্লাস কোড
              </div> // নাম অংশ শেষ
              <div className="grid grid-cols-2 gap-4"> // পরিসংখ্যান কার্ডসমূহ
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center"> // মোট ক্লাস
                  <span className="text-slate-500 text-xs block mb-1">Total Classes</span> // লেবেল
                  <span className="text-2xl font-bold text-slate-200">{attendanceData?.stats?.totalDays || 0}</span> // ডাটা
                </div> // কার্ড শেষ
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center"> // উপস্থিতি হার
                  <span className="text-slate-500 text-xs block mb-1">Attendance Rate</span> // লেবেল
                  <span className={`text-2xl font-bold ${Number(attendanceData?.stats?.percentage || 0) >= 75 ? "text-emerald-400" : "text-amber-500"}`}>{attendanceData?.stats?.percentage || 0}%</span> // ডাটা
                </div> // কার্ড শেষ
              </div> // পরিসংখ্যান শেষ
              <div className="space-y-3"> // দৈনিক রিপোর্টের লিস্ট
                <h5 className="text-sm font-semibold text-slate-400 flex items-center"> // সেকশন হেডার
                  <Calendar size={14} className="mr-1.5 text-emerald-500" /> // ক্যালেন্ডার আইকন
                  <span>Recent Class Records</span> // টেক্সট
                </h5> // হেডার শেষ
                {(!attendanceData?.attendance || attendanceData.attendance.length === 0) ? ( // যদি কোনো ক্লাস রেকর্ড না থাকে
                  <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950/40 rounded-lg border border-slate-850">No attendance records have been registered for this class yet.</p> // মেসেজ
                ) : ( // অন্যথায় তালিকা
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1"> // স্ক্রলযোগ্য তালিকা
                    {attendanceData.attendance.map((record: any) => ( // ম্যাপ শুরু
                      <div key={record.id} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/50 rounded-lg text-sm"> // রেকর্ড রো
                        <span className="text-slate-300 font-medium">{new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span> // তারিখ
                        {record.status === "PRESENT" ? ( // যদি উপস্থিত থাকে
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20"> // প্রেজেন্ট ব্যাজ
                            <CheckCircle2 size={12} /> // ওকে আইকন
                            <span>Present</span> // লেখা
                          </span> // ব্যাজ শেষ
                        ) : ( // অনুপস্থিত থাকলে
                          <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20"> // এবসেন্ট ব্যাজ
                            <XCircle size={12} /> // এরর আইকন
                            <span>Absent</span> // লেখা
                          </span> // ব্যাজ শেষ
                        )} // কন্ডিশনাল শেষ
                      </div> // রো শেষ
                    ))} // লুপ শেষ
                  </div> // তালিকা শেষ
                )} // কন্ডিশনাল শেষ
              </div> // দৈনিক রিপোর্ট শেষ
            </div> // কন্টেইনার শেষ
          )} // মূল প্রদর্শন শেষ
        </div> // ডান কলাম শেষ
      </div> // মেইন গ্রিড শেষ
      {isModalOpen && ( // যোগদান মডাল
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"> // ব্যাকড্রপ
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn"> // বডি
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div> // ডেকোরেটিভ গ্লো
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Join Classroom</h3> // শিরোনাম
            <p className="text-slate-400 text-sm mb-6">Enter the 6-character classroom code provided by your teacher to join.</p> // বিবরণী
            <form onSubmit={handleJoinClassroom} className="space-y-6"> // ফরম শুরু
              <div> // ইনপুট গ্রুপ
                <label className="block text-slate-300 text-sm font-semibold mb-2">Classroom Code</label> // লেবেল
                <input type="text" placeholder="e.g. AB12CD" maxLength={6} value={classCode} onChange={(e) => setClassCode(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 font-mono placeholder-slate-500 uppercase tracking-widest text-center text-lg transition duration-200" required disabled={isSubmitting} /> // ইনপুট বক্স
              </div> // গ্রুপ শেষ
              <div className="flex space-x-3"> // বাটন গ্রুপ
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer" disabled={isSubmitting}> // বাতিল বাটন
                  Cancel // বাতিল টেক্সট
                </button> // বাটন শেষ
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 cursor-pointer transform active:scale-95" disabled={isSubmitting}> // জয়েন বাটন
                  {isSubmitting ? "Joining..." : "Join Class"} // বাটন টেক্সট
                </button> // বাটন শেষ
              </div> // বাটন গ্রুপ শেষ
            </form> // ফরম শেষ
          </div> // বডি শেষ
        </div> // ব্যাকড্রপ শেষ
      )} // কন্ডিশনাল শেষ
    </div> // মেইন শেষ
  ); // রিটার্ন শেষ
} // কম্পোনেন্ট শেষ
