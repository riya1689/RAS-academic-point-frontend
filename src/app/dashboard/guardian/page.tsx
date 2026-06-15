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
  return (
    <div className="space-y-8">
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Guardian Portal</h2>
        <p className="text-slate-400 text-sm mt-1">Monitor your ward's academic status, classroom enrollments, and track attendance reports.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
      ) : !student ? (
        <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl">
          <User className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-300">No Student Profile Linked</h3>
          <p className="text-slate-500 text-sm mt-1">Please contact the administration to link your student to this account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">Linked Student</span>
                <h4 className="text-2xl font-bold text-slate-200">{student.user?.name || "Student Name"}</h4>
                <p className="text-xs text-slate-400 mt-1">Email: {student.user?.email || "No Email Address"}</p>
              </div>
              <div className="text-left sm:text-right text-sm text-slate-400">
                <div>Class: <span className="text-slate-200 font-semibold">{student.class}</span></div>
                <div>Roll No: <span className="text-slate-200 font-semibold">{student.roll}</span></div>
                <div>Dept: <span className="text-slate-200 font-semibold">{student.department}</span></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-300 mt-8">{student.user?.name}'s Enrolled Classrooms</h3>
            {classrooms.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/25 border border-slate-800 rounded-2xl text-slate-500">
                This student is not enrolled in any classrooms yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classrooms.map((cls) => (
                  <div key={cls.id} className={`group bg-slate-900/50 hover:bg-slate-900/80 border transition duration-200 shadow-xl rounded-2xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer ${selectedClassroom?.id === cls.id ? "border-emerald-500" : "border-slate-800/80 hover:border-slate-700"}`} onClick={() => handleViewAttendance(cls)}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition duration-200 inline-block">
                          <BookOpen size={22} />
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-200 group-hover:text-emerald-400 transition mb-2 truncate">{cls.title}</h4>
                      <p className="text-slate-400 text-xs flex items-center mb-6">
                        <User size={14} className="mr-1.5 text-emerald-500" />
                        <span>Teacher: {cls.teacher?.user?.name || "Academic Teacher"}</span>
                      </p>
                    </div>
                    <div className="w-full flex items-center justify-between py-2 text-xs font-semibold text-emerald-400">
                      <span>Check Student Attendance</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition duration-150" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-300">Attendance Report</h3>
            {!selectedClassroom ? (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
                Select a classroom card to monitor your child's attendance stats and logs.
              </div>
            ) : loadingAttendance ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <span className="text-slate-400 text-sm">Loading attendance history...</span>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-lg font-bold text-slate-200">{selectedClassroom.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Code: {selectedClassroom.classroomCode}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-500 text-xs block mb-1">Total Classes</span>
                    <span className="text-2xl font-bold text-slate-200">{attendanceData?.stats?.totalDays || 0}</span>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-500 text-xs block mb-1">Attendance Rate</span>
                    <span className={`text-2xl font-bold ${Number(attendanceData?.stats?.percentage || 0) >= 75 ? "text-emerald-400" : "text-amber-500"}`}>{attendanceData?.stats?.percentage || 0}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-slate-400 flex items-center">
                    <Calendar size={14} className="mr-1.5 text-emerald-500" />
                    <span>Class Records</span>
                  </h5>
                  {(!attendanceData?.attendance || attendanceData.attendance.length === 0) ? (
                    <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950/40 rounded-lg border border-slate-850">No attendance records have been registered for this class yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {attendanceData.attendance.map((record: any) => (
                        <div key={record.id} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/50 rounded-lg text-sm">
                          <span className="text-slate-300 font-medium">{new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          {record.status === "PRESENT" ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                              <CheckCircle2 size={12} />
                              <span>Present</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                              <XCircle size={12} />
                              <span>Absent</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} // // কম্পোনেন্ট শেষ
