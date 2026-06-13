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
    return ( // লোডিং স্ক্রিন
      <div className="flex justify-center items-center py-40"> // কন্টেইনার
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div> // স্পিনার
      </div> // কন্টেইনার শেষ
    ); // রিটার্ন শেষ
  } // লোডিং শেষ
  if (!classroom) { // ক্লাসরুম পাওয়া না গেলে
    return ( // এরর ভিউ
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800"> // মেইন কন্টেইনার
        <h3 className="text-2xl font-bold text-slate-300">Classroom Not Found</h3> // মেসেজ
        <p className="text-slate-500 mt-2 mb-6">The classroom you are looking for does not exist or you do not have permission to view it.</p> // সাব-টেক্সট
        <button onClick={() => router.push("/dashboard/teacher")} className="inline-flex items-center space-x-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-xl transition"> // বাটন
          <ArrowLeft size={16} /> // ব্যাক আইকন
          <span>Back to Portal</span> // বাটন টেক্সট
        </button> // বাটন শেষ
      </div> // মেইন শেষ
    ); // রিটার্ন শেষ
  } // ইফ শেষ
  return ( // মূল ভিউ রিটার্ন
    <div className="space-y-8 animate-fadeIn"> // রুট কন্টেইনার
      <div className="flex items-center space-x-4"> // ব্যাক বাটন ও টাইটেল সেকশন
        <button onClick={() => router.push("/dashboard/teacher")} className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 transition duration-150 cursor-pointer"> // ব্যাক বাটন
          <ArrowLeft size={20} /> // ব্যাক আইকন
        </button> // বাটন শেষ
        <div> // শিরোনাম অংশ
          <h2 className="text-2xl font-bold text-slate-200 flex items-center"> // টাইটেল টেক্সট
            <BookOpen size={22} className="mr-2 text-emerald-500" /> // আইকন
            <span>{classroom.title}</span> // ক্লাসের নাম
          </h2> // টাইটেল শেষ
          <p className="text-slate-400 text-xs mt-0.5">Classroom Code: <span className="font-mono text-emerald-400 font-semibold">{classroom.classroomCode}</span></p> // কোড টেক্সট
        </div> // শিরোনাম শেষ অংশ
      </div> // ব্যাক সেকশন শেষ
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> // মূল কলাম গ্রিড
        <div className="lg:col-span-2 space-y-6"> // বাম দিকের মূল অংশ - উপস্থিতি তালিকা
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6"> // প্যানেল
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60"> // ফিল্টার কন্ট্রোল রো
              <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2"> // তারিখ ইনপুট কন্টেইনার
                <Calendar size={18} className="text-emerald-500" /> // ক্যালেন্ডার আইকন
                <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-transparent border-none text-slate-200 focus:outline-none text-sm font-semibold cursor-pointer" /> // তারিখ ইনপুট বক্স
              </div> // তারিখ কন্টেইনার শেষ
              <div className="flex space-x-2"> // বালক একশন বাটন
                <button onClick={() => handleMarkAll("PRESENT")} className="text-xs font-semibold px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition cursor-pointer"> // বাটন
                  Mark All Present // টেক্সট
                </button> // বাটন শেষ
                <button onClick={() => handleMarkAll("ABSENT")} className="text-xs font-semibold px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition cursor-pointer"> // বাটন
                  Mark All Absent // টেক্সট
                </button> // বাটন শেষ
              </div> // একশন বাটন শেষ
            </div> // ফিল্টার কন্ট্রোল রো শেষ
            {(!classroom.members || classroom.members.length === 0) ? ( // যদি কোনো শিক্ষার্থী না থাকে
              <div className="text-center py-16 text-slate-500"> // নো ডাটা বক্স
                <Users className="mx-auto mb-4 text-slate-700" size={40} /> // আইকন
                <p>No students enrolled in this classroom yet.</p> // মেসেজ
              </div> // নো ডাটা শেষ
            ) : ( // অন্যথায় তালিকা
              <div className="overflow-x-auto"> // স্ক্রল কন্টেইনার
                <table className="w-full text-left border-collapse"> // টেবিল শুরু
                  <thead> // টেবিল হেডার
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider"> // হেডার রো
                      <th className="pb-3 pl-2">Student Info</th> // স্টুডেন্ট কলাম
                      <th className="pb-3">Roll & Class</th> // রোল ও ক্লাস কলাম
                      <th className="pb-3 text-right pr-2">Attendance State</th> // স্ট্যাটাস কলাম
                    </tr> // হেডার রো শেষ
                  </thead> // হেডার শেষ
                  <tbody className="divide-y divide-slate-850"> // টেবিল বডি
                    {classroom.members.map((member: any) => ( // স্টুডেন্ট রো ম্যাপ
                      <tr key={member.id} className="hover:bg-slate-900/25 transition"> // টেবিল রো
                        <td className="py-4 pl-2"> // স্টুডেন্ট ডাটা
                          <div className="font-semibold text-slate-200">{member.student?.user?.name || "Name"}</div> // নাম
                          <div className="text-xs text-slate-500 flex items-center mt-0.5"> // ইমেইল বা আইডি
                            <Mail size={12} className="mr-1" /> // আইকন
                            <span>{member.student?.user?.email || "No Email"}</span> // ইমেইল টেক্সট
                          </div> // আইডি শেষ
                        </td> // স্টুডেন্ট ডাটা শেষ
                        <td className="py-4 text-slate-400 text-sm"> // রোল ও ক্লাস ডাটা
                          <div>Roll: <span className="text-slate-300 font-semibold">{member.student?.roll || "N/A"}</span></div> // রোল
                          <div className="text-xs text-slate-500 mt-0.5">Class: {member.student?.class || "N/A"}</div> // ক্লাস
                        </td> // রোল ও ক্লাস শেষ
                        <td className="py-4 text-right pr-2"> // এটেন্ডেন্স বাটন গ্রুপ
                          <div className="inline-flex p-0.5 bg-slate-950/80 border border-slate-850 rounded-xl"> // বাটন র‍্যাপার
                            <button onClick={() => handleStatusChange(member.student?.id, "PRESENT")} className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${records[member.student?.id] === "PRESENT" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}> // প্রেজেন্ট বাটন
                              <Check size={14} /> // চেক আইকন
                              <span>Present</span> // টেক্সট
                            </button> // বাটন শেষ
                            <button onClick={() => handleStatusChange(member.student?.id, "ABSENT")} className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${records[member.student?.id] === "ABSENT" ? "bg-rose-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"}`}> // এবসেন্ট বাটন
                              <X size={14} /> // ক্রস আইকন
                              <span>Absent</span> // টেক্সট
                            </button> // বাটন শেষ
                          </div> // বাটন র‍্যাপার শেষ
                        </td> // এটেন্ডেন্স কলাম শেষ
                      </tr> // টেবিল রো শেষ
                    ))} // লুপ শেষ
                  </tbody> // বডি শেষ
                </table> // টেবিল শেষ
              </div> // স্ক্রল কন্টেইনার শেষ
            )} // কন্ডিশনাল রেন্ডার শেষ
          </div> // প্যানেল শেষ
        </div> // বাম কলাম শেষ
        <div className="space-y-6"> // ডান কলাম - অ্যাকশন ও মেম্বার সংক্ষিপ্ত বিবরণ
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6"> // কার্ড কন্টেইনার
            <h3 className="text-lg font-bold text-slate-200">Submit Records</h3> // হেডার
            <p className="text-slate-400 text-xs leading-relaxed">Save the attendance records for the selected date to the backend database. You can re-submit records for the same date to update them.</p> // তথ্য
            <button onClick={handleSubmit} disabled={isSubmitting || !classroom.members || classroom.members.length === 0} className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform active:scale-95"> // সেভ বাটন
              {isSubmitting ? ( // সাবমিটিং এর ক্ষেত্রে স্পিনার
                <RefreshCw size={16} className="animate-spin mr-1" /> // স্পিনার
              ) : ( // ডিফল্টভাবে সেভ আইকন
                <Save size={16} className="mr-1" /> // সেভ আইকন
              )} // কন্ডিশনাল শেষ
              <span>{isSubmitting ? "Submitting..." : "Save Attendance"}</span> // বাটন টেক্সট
            </button> // বাটন শেষ
          </div> // কার্ড শেষ
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4"> // ক্লাস সাইডবার কার্ড
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center"> // হেডার
              <Users size={16} className="mr-1.5 text-emerald-500" /> // ইউজার আইকন
              <span>Classroom Stats</span> // টাইটেল
            </h4> // হেডার শেষ
            <div className="divide-y divide-slate-850"> // লিস্ট কন্টেইনার
              <div className="flex justify-between py-2 text-sm"> // পরিসংখ্যান আইটেম
                <span className="text-slate-400">Total Enrolled</span> // মোট নথিভুক্ত
                <span className="text-slate-200 font-bold">{(classroom.members || []).length} Students</span> // সংখ্যা
              </div> // আইটেম শেষ
              <div className="flex justify-between py-2 text-sm"> // পরিসংখ্যান আইটেম
                <span className="text-slate-400">Teacher In Charge</span> // দায়িত্ব থাকা শিক্ষক
                <span className="text-slate-200 font-semibold">{classroom.teacher?.qualification || "Faculty Teacher"}</span> // শিক্ষাগত যোগ্যতা
              </div> // আইটেম শেষ
            </div> // লিস্ট শেষ
          </div> // সাইডবার কার্ড শেষ
        </div> // ডান কলাম শেষ
      </div> // গ্রিড শেষ
    </div> // রুট কন্টেইনার শেষ
  ); // রিটার্ন শেষ
} // কম্পোনেন্ট শেষ
