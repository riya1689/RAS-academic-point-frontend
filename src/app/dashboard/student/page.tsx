"use client"; // ক্লায়েন্ট সাইড রেন্ডারিং নির্দেশ করছে
import { useEffect, useState } from "react"; // রিঅ্যাক্ট হুকসমূহ আমদানী করা হচ্ছে
import { toast } from "react-hot-toast"; // টোস্ট নোটিফিকেশন লাইব্রেরি আমদানী
import { Plus, BookOpen, Calendar, CheckCircle2, XCircle, ArrowRight, User, CreditCard, DollarSign, Wallet } from "lucide-react"; // প্রয়োজনী লুসিড আইকনসমূহ আমদানী
import { getStudentClassrooms, joinClassroom, getStudentAttendance } from "../../../lib/classroom.api"; // ক্লাসরুম এপিআই মেথডসমূহ আমদানী
import { getTuitionLogs, createCheckoutSession } from "../../../lib/payment.api"; // টিউশন পেমেন্ট এপিআই

export default function StudentDashboard() { // ছাত্র ড্যাশবোর্ড কম্পোনেন্টের মূল ডিক্লারেশন
  const [activeTab, setActiveTab] = useState<"classroom" | "tuition">("classroom"); // অ্যাক্টিভ ট্যাব স্টেট
  const [classrooms, setClassrooms] = useState<any[]>([]); // ছাত্রের যুক্ত হওয়া ক্লাসরুম তালিকা স্টেট
  const [isLoading, setIsLoading] = useState(true); // ডাটা লোডিং স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false); // ক্লাস কোড দিয়ে যোগদানের মডাল স্টেট
  const [classCode, setClassCode] = useState(""); // ক্লাস কোডের ইনপুট স্টেট
  const [isSubmitting, setIsSubmitting] = useState(false); // সাবমিটিং লোডার স্টেট
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null); // বিস্তারিত উপস্থিতি দেখার জন্য নির্বাচিত ক্লাসরুম
  const [attendanceData, setAttendanceData] = useState<any>(null); // নির্বাচিত ক্লাসের উপস্থিতি রেকর্ডের ডাটা স্টেট
  const [loadingAttendance, setLoadingAttendance] = useState(false); // উপস্থিতি লোডিং স্টেট

  // Tuition specific states
  const [tuitionLogs, setTuitionLogs] = useState<any[]>([]);
  const [loadingTuition, setLoadingTuition] = useState(false);
  const [isPayingMonth, setIsPayingMonth] = useState<string | null>(null);

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

  const fetchTuitionLogs = async () => {
    try {
      setLoadingTuition(true);
      const data = await getTuitionLogs();
      setTuitionLogs(data.tuitionLogs || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load tuition logs");
    } finally {
      setLoadingTuition(false);
    }
  };

  useEffect(() => { // ফার্স্ট রেন্ডার ইফেক্ট
    fetchClassrooms();
    fetchTuitionLogs();

    // Check Stripe checkout redirect results in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        const month = params.get("month");
        toast.success(`Tuition fee for ${month} has been paid successfully!`, { duration: 5000 });
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab("tuition");
      } else if (params.get("payment") === "cancel") {
        toast.error("Stripe payment was cancelled.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab("tuition");
      }
    }
  }, []);

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

  const handleCheckout = async (month: string, amount: number) => {
    try {
      setIsPayingMonth(month);
      const data = await createCheckoutSession(month, amount);
      if (data.checkoutUrl) {
        toast.loading("Redirecting to Stripe secure portal...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Checkout session URL not returned from backend.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start payment process");
    } finally {
      setIsPayingMonth(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Student Portal</h2>
          <p className="text-slate-400 text-sm mt-1">Join classrooms, view class resources, track attendance, and pay tuition fees securely.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer transform hover:scale-[1.02] text-sm">
            <Plus size={18} />
            <span>Join Classroom</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("classroom")}
          className={`px-6 py-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[2px] ${
            activeTab === "classroom"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Classrooms & Attendance
        </button>
        <button
          onClick={() => {
            setActiveTab("tuition");
            fetchTuitionLogs();
          }}
          className={`px-6 py-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[2px] ${
            activeTab === "tuition"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Tuition Fees & Payments
        </button>
      </div>

      {activeTab === "classroom" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-slate-300">My Classrooms</h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl">
                <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-300">No Classrooms Joined</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Enter a class code provided by your teacher to join a class.</p>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer">
                  <Plus size={16} />
                  <span>Join First Class</span>
                </button>
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
                      <span>View Attendance Logs</span>
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
                Select a classroom card to check your active attendance history and performance statistics.
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
                    <span>Recent Class Records</span>
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
      ) : (
        /* Tuition portal view */
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <Wallet size={20} className="text-emerald-400" />
              <span>Tuition Payment Ledger</span>
            </h3>
            <span className="text-slate-400 text-xs">Standard monthly tuition fee: <b className="text-slate-200">1500 BDT</b></span>
          </div>

          {loadingTuition && tuitionLogs.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Billing Month</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Transaction Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {tuitionLogs.map((log) => {
                      const isPending = log.status === "PENDING";
                      const isPaid = log.status === "PAID";
                      const isUnpaid = log.status === "UNPAID";

                      return (
                        <tr key={log.month} className="hover:bg-slate-800/10 transition duration-150">
                          <td className="p-4 font-semibold text-slate-300">{log.month}</td>
                          <td className="p-4 text-slate-300 font-mono">{log.amount} BDT</td>
                          <td className="p-4">
                            {isPaid && (
                              <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                <CheckCircle2 size={12} />
                                <span>Paid</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold text-xs bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                                <Calendar size={12} />
                                <span>Pending Approval</span>
                              </span>
                            )}
                            {isUnpaid && (
                              <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                                <XCircle size={12} />
                                <span>Unpaid</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-400 font-medium">
                            {log.paymentMethod ? (
                              <span className="text-xs uppercase bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300 font-mono">
                                {log.paymentMethod}
                              </span>
                            ) : (
                              <span className="text-slate-650 italic text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-400 font-mono text-xs">
                            {log.paymentDate
                              ? new Date(log.paymentDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "-"}
                          </td>
                          <td className="p-4 text-right">
                            {isUnpaid && (
                              <button
                                onClick={() => handleCheckout(log.month, log.amount)}
                                disabled={isPayingMonth === log.month}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition duration-150 cursor-pointer disabled:opacity-50"
                              >
                                <CreditCard size={12} />
                                <span>{isPayingMonth === log.month ? "Processing..." : "Pay Online"}</span>
                              </button>
                            )}
                            {isPaid && (
                              <span className="text-emerald-500/80 font-bold text-xs inline-flex items-center space-x-1">
                                <CheckCircle2 size={12} />
                                <span>Settled</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="text-amber-500/80 font-bold text-xs inline-flex items-center space-x-1">
                                <span>Awaiting Verification</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
}
