"use client"; // ক্লায়েন্ট সাইড রেন্ডারিং নির্দেশ করছে
import { useEffect, useState } from "react"; // রিঅ্যাক্ট হুকসমূহ আমদানী করা হচ্ছে
import { toast } from "react-hot-toast"; // টোস্ট নোটিফিকেশন লাইব্রেরি আমদানী
import { BookOpen, Calendar, CheckCircle2, XCircle, ArrowRight, User } from "lucide-react"; // প্রয়োজনী লুসিড আইকনসমূহ আমদানী
import { getGuardianStudentClassrooms, getGuardianStudentAttendance } from "../../../lib/classroom.api"; // ক্লাসরুম এপিআই মেথডসমূহ আমদানী
export default function GuardianDashboard() { // অভিভাবক ড্যাশবোর্ড কম্পোনেন্টের মূল ডিক্লারেশন
  const [student, setStudent] = useState<any>(null); // অভিভাবকের শিক্ষার্থীর প্রোফাইল স্টেট
  const [classrooms, setClassrooms] = useState<any[]>([]); // শিক্ষার্থীর ক্লাসরুমের তালিকা স্টেট
  const [isLoading, setIsLoading] = useState(true); // ডাটা লোডিং স্টেট
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null); // নির্বাচিত ক্লাসরুমের স্টেট
  const [attendanceData, setAttendanceData] = useState<any>(null); // শিক্ষার্থীর উপস্থিতি রেকর্ডের ডাটা স্টেট
  const [loadingAttendance, setLoadingAttendance] = useState(false); // উপস্থিতি লোডিং স্টেট
  const fetchData = async () => { // ডাটাবেজ থেকে শিক্ষার্থীর তথ্য ও ক্লাসের তালিকা সংগ্রহের ফাংশন
    try { // // ট্রাই ব্লক শুরু
      const data = await getGuardianStudentClassrooms(); // এপিআই কল করে অভিভাবকের শিক্ষার্থীর ক্লাসের তালিকা আনা হচ্ছে
      setStudent(data.student || null); // শিক্ষার্থীর প্রফাইল সেট
      setClassrooms(data.classrooms || []); // ক্লাসের তালিকা সেট
    } catch (error: any) { // এরর ক্যাচ ব্লক
      toast.error(error.response?.data?.message || "Failed to load ward data"); // এরর টোস্ট বার্তা
    } finally { // সবশেষে
      setIsLoading(false); // লোডার বন্ধ
    } // ট্রাই-ক্যাচ শেষ
  }; // // ফাংশন শেষ
  useEffect(() => { // ফার্স্ট মাউন্ট ইফেক্ট
    fetchData(); // ডাটা লোড করা হচ্ছে
  }, []); // খালি ডিপেন্ডেন্সি
  const handleViewAttendance = async (classroom: any) => { // উপস্থিতি রিপোর্ট দেখার ফাংশন
    setSelectedClassroom(classroom); // নির্বাচিত ক্লাসরুম সেভ করা হচ্ছে
    setLoadingAttendance(true); // উপস্থিতি ডাটা লোড স্টেট ট্রু করা হচ্ছে
    try { // ট্রাই ব্লক
      const data = await getGuardianStudentAttendance(classroom.id); // শিক্ষার্থীর উপস্থিতি রেকর্ড পাওয়ার এপিআই কল
      setAttendanceData(data); // উপস্থিতি ডাটা সংরক্ষণ
    } catch (error: any) { // এরর ক্যাচ
      toast.error(error.response?.data?.message || "Failed to load attendance records"); // এরর নোটিফিকেশন
    } finally { // সবশেষে লোড শেষ করা হচ্ছে
      setLoadingAttendance(false); // উপস্থিতি লোডিং ফলস
    } // ট্রাই-ক্যাচ সমাপ্তি
  }; // ফাংশন শেষ
  return ( // রিটার্ন ভিউ শুরু
    <div className="space-y-8"> // মেইন কন্টেইনার
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md"> // হেডার পার্ট
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Guardian Portal</h2> // // শিরোনাম
        <p className="text-slate-400 text-sm mt-1">Monitor your ward's academic status, classroom enrollments, and track attendance reports.</p> // বিবরণ
      </div> // হেডার কার্ড শেষ
      {isLoading ? ( // কন্ডিশনাল রেন্ডার: লোডিং
        <div className="flex justify-center items-center py-20"> // স্পিনার কন্টেইনার
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div> // স্পিনার
        </div> // স্পিনার কন্টেইনার শেষ
      ) : !student ? ( // অন্যথায় যদি শিক্ষার্থীর কোনো প্রোফাইল না থাকে
        <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl"> // নো-ডাটা কন্টেইনার
          <User className="mx-auto text-slate-600 mb-4" size={48} /> // আইকন
          <h3 className="text-xl font-bold text-slate-300">No Student Profile Linked</h3> // // টেক্সট
          <p className="text-slate-500 text-sm mt-1">Please contact the administration to link your student to this account.</p> // সাব-টেক্সট
        </div> // নো-ডাটা শেষ
      ) : ( // যদি প্রোফাইল থাকে
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> // মূল ড্যাশবোর্ড গ্রিড
          <div className="lg:col-span-2 space-y-6"> // বাম কলাম
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between gap-4"> // শিক্ষার্থীর তথ্য কার্ড
              <div> // বাম অংশ
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">Linked Student</span> // เลবেল
                <h4 className="text-2xl font-bold text-slate-200">{student.user?.name || "Student Name"}</h4> // শিক্ষার্থীর নাম
                <p className="text-xs text-slate-400 mt-1">Email: {student.user?.email || "No Email Address"}</p> // ইমেইল
              </div> // বাম অংশ শেষ
              <div className="text-left sm:text-right text-sm text-slate-400"> // ডান অংশ
                <div>Class: <span className="text-slate-200 font-semibold">{student.class}</span></div> // ক্লাস
                <div>Roll No: <span className="text-slate-200 font-semibold">{student.roll}</span></div> // রোল
                <div>Dept: <span className="text-slate-200 font-semibold">{student.department}</span></div> // ডিপার্টমেন্ট
              </div> // ডান অংশ শেষ
            </div> // কার্ড শেষ
            <h3 className="text-xl font-bold text-slate-300 mt-8">{student.user?.name}'s Enrolled Classrooms</h3> // সেকশন হেডার
            {classrooms.length === 0 ? ( // যদি কোনো ক্লাস না থাকে
              <div className="text-center py-12 bg-slate-900/25 border border-slate-800 rounded-2xl text-slate-500"> // নো ডাটা
                This student is not enrolled in any classrooms yet. // মেসেজ
              </div> // নো ডাটা শেষ
            ) : ( // অন্যথায় তালিকা
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
                      <span>Check Student Attendance</span> // ভিউ টেক্সট
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition duration-150" /> // অ্যারো আইকন
                    </div> // নিচের অংশ শেষ
                  </div> // // কার্ড শেষ
                ))} // ম্যাপ শেষ
              </div> // গ্রিড শেষ
            )} // কন্ডিশনাল শেষ
          </div> // বাম কলাম শেষ
          <div className="space-y-6"> // ডান কলাম
            <h3 className="text-xl font-bold text-slate-300">Attendance Report</h3> // সেকশন হেডার
            {!selectedClassroom ? ( // যদি কোনো ক্লাস সিলেক্ট না করা থাকে
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm"> // সিলেক্ট করুন নির্দেশক বার্তা
                Select a classroom card to monitor your child's attendance stats and logs. // // বার্তা টেক্সট
              </div> // বার্তা শেষ
            ) : loadingAttendance ? ( // সিলেক্ট করা হলে ও যদি লোড হতে থাকে
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"> // লোডিং বক্স
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div> // // স্পিনার
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
                    <span className="text-slate-500 text-xs block mb-1">Total Classes</span> // เลবেল
                    <span className="text-2xl font-bold text-slate-200">{attendanceData?.stats?.totalDays || 0}</span> // ডাটা
                  </div> // কার্ড শেষ
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center"> // উপস্থিতি হার
                    <span className="text-slate-500 text-xs block mb-1">Attendance Rate</span> // เลবেল
                    <span className={`text-2xl font-bold ${Number(attendanceData?.stats?.percentage || 0) >= 75 ? "text-emerald-400" : "text-amber-500"}`}>{attendanceData?.stats?.percentage || 0}%</span> // ডাটা
                  </div> // কার্ড শেষ
                </div> // পরিসংখ্যান শেষ
                <div className="space-y-3"> // দৈনিক রিপোর্টের লিস্ট
                  <h5 className="text-sm font-semibold text-slate-400 flex items-center"> // সেকশন হেডার
                    <Calendar size={14} className="mr-1.5 text-emerald-500" /> // ক্যালেন্ডার আইকন
                    <span>Class Records</span> // টেক্সট
                  </h5> // হেডার শেষ
                  {(!attendanceData?.attendance || attendanceData.attendance.length === 0) ? ( // যদি কোনো ক্লাস রেকর্ড না থাকে
                    <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950/40 rounded-lg border border-slate-850">No attendance records have been registered for this class yet.</p> // মেসেজ
                  ) : ( // অন্যথায় তালিকা
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1"> // স্ক্রলযোগ্য তালিকা
                      {attendanceData.attendance.map((record: any) => ( // ম্যাপ শুরু
                        <div key={record.id} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/50 rounded-lg text-sm"> // রেকর্ড রো
                          <span className="text-slate-300 font-medium">{new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span> // तारीख
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
                    </div> // // তালিকা শেষ
                  )} // কন্ডিশনাল শেষ
                </div> // দৈনিক রিপোর্ট শেষ
              </div> // কন্টেইনার শেষ
            )} // মূল প্রদর্শন শেষ
          </div> // ডান কলাম শেষ
        </div> // মূল গ্রিড শেষ
      )} // মূল কন্ডিশনাল রেন্ডার শেষ
    </div> // মেইন শেষ
  ); // রিটার্ন শেষ
} // // কম্পোনেন্ট শেষ
