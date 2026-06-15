"use client"; // ক্লায়েন্ট সাইড রেন্ডারিং নির্দেশ করছে
import { useEffect, useState, use } from "react"; // রিঅ্যাক্ট হুকসমূহ আমদানী করা হচ্ছে
import { useRouter } from "next/navigation"; // নেভিগেশন রাউটার আমদানী
import { toast } from "react-hot-toast"; // টোস্ট নোটিফিকেশন লাইব্রেরি আমদানী
import { ArrowLeft, Calendar, Save, Check, X, RefreshCw, Users, Mail, BookOpen } from "lucide-react"; // প্রয়োজনী লুসিড আইকনসমূহ আমদানী
import { getClassroomDetails, submitAttendance } from "../../../../../lib/classroom.api"; // ক্লাসরুম এপিআই মেথডসমূহ আমদানী
export default function ClassroomDetailsPage({ params }: { params: Promise<{ id: string }> }) { // শিক্ষকের ক্লাসরুম বিস্তারিত পেজ কম্পোনেন্ট
  const router = useRouter(); // রাউটার ইনস্ট্যান্স
  const { id: classroomId } = use(params); // রিঅ্যাক্ট ১৯ এর আনর‍্যাপ মেথড দিয়ে আইডি নেওয়া হচ্ছে
  const [classroom, setClassroom] = useState<any>(null); // ক্লাসরুম ডাটা স্টেট
  const [isLoading, setIsLoading] = useState(true); // ডাটা লোডিং স্টেট
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]); // উপস্থিতি নেওয়ার তারিখ স্টেট
  const [records, setRecords] = useState<Record<string, "PRESENT" | "ABSENT">>({}); // উপস্থিতির তথ্য ম্যাপ
  const [isSubmitting, setIsSubmitting] = useState(false); // সাবমিটিং লোডার স্টেট
  const fetchDetails = async () => { // ক্লাসরুমের সম্পূর্ণ তথ্য লোডের ফাংশন
    try { // ট্রাই ব্লক শুরু
      setIsLoading(true); // লোডার সচল
      const data = await getClassroomDetails(classroomId); // এপিআই দিয়ে বিস্তারিত তথ্য লোড
      setClassroom(data.classroom || null); // স্টেট এ ডাটা সেট
      const initialRecords: Record<string, "PRESENT" | "ABSENT"> = {}; // প্রাথমিক উপস্থিতির ম্যাপ তৈরি
      (data.classroom?.members || []).forEach((member: any) => { // মেম্বারদের লুপ চালিয়ে
        if (member.student?.id) { // যদি স্টুডেন্ট আইডি থাকে
          initialRecords[member.student.id] = "PRESENT"; // ডিফল্টভাবে সবাইকে প্রেজেন্ট বা উপস্থিত সেট করা হচ্ছে
        } // ইফ ব্লক শেষ
      }); // লুপ শেষ
      setRecords(initialRecords); // রেকর্ড স্টেট আপডেট করা হচ্ছে
    } catch (error: any) { // এরর ক্যাচ ব্লক
      toast.error(error.response?.data?.message || "Failed to load classroom details"); // এরর মেসেজ টোস্ট
    } finally { // সবশেষে লোডার বন্ধ
      setIsLoading(false); // লোডার মিথ্যা
    } // ট্রাই-ক্যাচ শেষ
  }; // ফাংশন শেষ
  useEffect(() => { // ফার্স্ট মাউন্ট হুক
    fetchDetails(); // তথ্য লোড করা হচ্ছে
  }, [classroomId]); // ক্লাসরুম আইডি পরিবর্তন সাপেক্ষে রি-রান
  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT") => { // ছাত্রের উপস্থিতি পরিবর্তনের হ্যান্ডলার
    setRecords((prev) => ({ ...prev, [studentId]: status })); // সংশ্লিষ্ট স্টুডেন্ট এর স্ট্যাটাস আপডেট
  }; // ফাংশন শেষ
  const handleMarkAll = (status: "PRESENT" | "ABSENT") => { // সবাইকে একসাথে প্রেজেন্ট বা এবসেন্ট করার ফাংশন
    const updated: Record<string, "PRESENT" | "ABSENT"> = {}; // নতুন রেকর্ড অবজেক্ট ডিক্লারেশন
    Object.keys(records).forEach((studentId) => { // সব কী বা স্টুডেন্ট আইডি এর লুপে
      updated[studentId] = status; // নতুন স্ট্যাটাস অ্যাসাইন
    }); // লুপ শেষ
    setRecords(updated); // স্টেট আপডেট
    toast.success(`Marked all students as ${status.toLowerCase()}`); // নোটিফিকেশন প্রদর্শন
  }; // ফাংশন শেষ
  const handleSubmit = async () => { // ডাটাবেজে সাবমিট করার ফাংশন
    try { // ট্রাই ব্লক শুরু
      setIsSubmitting(true); // সাবমিটিং লোডার অন
      const formattedRecords = Object.entries(records).map(([studentId, status]) => ({ // ডাটা ফরম্যাটিং
        studentId, // ছাত্র আইডি
        status, // উপস্থিতি অবস্থা
      })); // ম্যাপ শেষ
      await submitAttendance(classroomId, attendanceDate, formattedRecords); // এপিআই কল করে সাবমিশন সম্পন্ন
      toast.success("Attendance submitted successfully!"); // সফলতার বার্তা
    } catch (error: any) { // এরর ক্যাচ
      toast.error(error.response?.data?.message || "Failed to submit attendance"); // এরর টোস্ট
    } finally { // সবশেষে
      setIsSubmitting(false); // লোডার অফ
    } // ট্রাই-ক্যাচ ব্লক শেষ
  }; // সাবমিট ফাংশন শেষ
  if (isLoading) { // লোড হতে থাকলে
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  } // লোডিং শেষ
  if (!classroom) { // ক্লাসরুম পাওয়া না গেলে
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
        <h3 className="text-2xl font-bold text-slate-300">Classroom Not Found</h3>
        <p className="text-slate-500 mt-2 mb-6">The classroom you are looking for does not exist or you do not have permission to view it.</p>
        <button onClick={() => router.push("/dashboard/teacher")} className="inline-flex items-center space-x-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-xl transition">
          <ArrowLeft size={16} />
          <span>Back to Portal</span>
        </button>
      </div>
    );
  } // ইফ শেষ
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.push("/dashboard/teacher")} className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 transition duration-150 cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center">
            <BookOpen size={22} className="mr-2 text-emerald-500" />
            <span>{classroom.title}</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Classroom Code: <span className="font-mono text-emerald-400 font-semibold">{classroom.classroomCode}</span></p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60">
              <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2">
                <Calendar size={18} className="text-emerald-500" />
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-transparent border-none text-slate-200 focus:outline-none text-sm font-semibold cursor-pointer" />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleMarkAll("PRESENT")} className="text-xs font-semibold px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition cursor-pointer">
                  Mark All Present
                </button>
                <button onClick={() => handleMarkAll("ABSENT")} className="text-xs font-semibold px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition cursor-pointer">
                  Mark All Absent
                </button>
              </div>
            </div>
            {(!classroom.members || classroom.members.length === 0) ? (
              <div className="text-center py-16 text-slate-500">
                <Users className="mx-auto mb-4 text-slate-700" size={40} />
                <p>No students enrolled in this classroom yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Student Info</th>
                      <th className="pb-3">Roll & Class</th>
                      <th className="pb-3 text-right pr-2">Attendance State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {classroom.members.map((member: any) => (
                      <tr key={member.id} className="hover:bg-slate-900/25 transition">
                        <td className="py-4 pl-2">
                          <div className="font-semibold text-slate-200">{member.student?.user?.name || "Name"}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-0.5">
                            <Mail size={12} className="mr-1" />
                            <span>{member.student?.user?.email || "No Email"}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-400 text-sm">
                          <div>Roll: <span className="text-slate-300 font-semibold">{member.student?.roll || "N/A"}</span></div>
                          <div className="text-xs text-slate-500 mt-0.5">Class: {member.student?.class || "N/A"}</div>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <div className="inline-flex p-0.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                            <button onClick={() => handleStatusChange(member.student?.id, "PRESENT")} className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${records[member.student?.id] === "PRESENT" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                              <Check size={14} />
                              <span>Present</span>
                            </button>
                            <button onClick={() => handleStatusChange(member.student?.id, "ABSENT")} className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${records[member.student?.id] === "ABSENT" ? "bg-rose-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}>
                              <X size={14} />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-200">Submit Records</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Save the attendance records for the selected date to the backend database. You can re-submit records for the same date to update them.</p>
            <button onClick={handleSubmit} disabled={isSubmitting || !classroom.members || classroom.members.length === 0} className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform active:scale-95">
              {isSubmitting ? (
                <RefreshCw size={16} className="animate-spin mr-1" />
              ) : (
                <Save size={16} className="mr-1" />
              )}
              <span>{isSubmitting ? "Submitting..." : "Save Attendance"}</span>
            </button>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Users size={16} className="mr-1.5 text-emerald-500" />
              <span>Classroom Stats</span>
            </h4>
            <div className="divide-y divide-slate-850">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-400">Total Enrolled</span>
                <span className="text-slate-200 font-bold">{(classroom.members || []).length} Students</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-400">Teacher In Charge</span>
                <span className="text-slate-200 font-semibold">{classroom.teacher?.qualification || "Faculty Teacher"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} // কম্পোনেন্ট শেষ
