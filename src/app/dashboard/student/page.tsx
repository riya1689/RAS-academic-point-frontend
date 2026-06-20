"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, BookOpen, Calendar, CheckCircle2, XCircle, ArrowRight, User, CreditCard, DollarSign, Wallet } from "lucide-react";
import { getTuitionLogs, createCheckoutSession, getMyEnrollments, verifyEnrollmentSession } from "../../../lib/payment.api";

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "classroom";

  const [tuitionLogs, setTuitionLogs] = useState<any[]>([]);
  const [loadingTuition, setLoadingTuition] = useState(false);
  const [isPayingMonth, setIsPayingMonth] = useState<string | null>(null);

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

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

  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const data = await getMyEnrollments();
      setEnrollments(data.enrollments || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchTuitionLogs();
    fetchEnrollments();

    const verifySessionIfNeeded = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("payment") === "success") {
          const month = params.get("month");
          toast.success(`Tuition fee for ${month} has been paid successfully!`, { duration: 5000 });
          router.replace("/dashboard/student?tab=tuition");
        } else if (params.get("payment") === "cancel") {
          toast.error("Stripe payment was cancelled.");
          router.replace("/dashboard/student?tab=tuition");
        } else if (params.get("enrollment") === "success") {
          const classId = params.get("classId");
          const sessionId = params.get("session_id");
          if (sessionId) {
            try {
              toast.loading("Verifying your enrollment...");
              await verifyEnrollmentSession(sessionId);
              toast.dismiss();
            } catch (error) {
              console.error(error);
            }
          }
          toast.success(`Successfully enrolled in ${classId}! Your dashboard has been updated.`, { duration: 5000 });
          router.replace("/dashboard/student");
        }
      }
    };

    verifySessionIfNeeded();
  }, []);

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
        {activeTab === "classroom" && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => router.push("/dashboard/student/join-classroom")} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer transform hover:scale-[1.02] text-sm">
              <Plus size={18} />
              <span>Join Classroom</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === "classroom" ? (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-300">My Enrolled Courses</h3>
          {loadingEnrollments ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
          ) : enrollments.length === 0 ? (
             <div className="text-center py-8 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl">
               <p className="text-slate-500 text-sm">You haven't enrolled in any premium courses yet.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
               {enrollments.map((enr) => (
                 <div key={enr.id} className="group bg-slate-900/50 hover:bg-slate-900/80 border border-emerald-500/30 transition shadow-lg rounded-2xl overflow-hidden flex flex-col">
                   <div className="h-32 w-full overflow-hidden bg-slate-800 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
                      <img src={`/images/${enr.classId.toLowerCase().replace(" ", "")}.jpg`} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop" }} alt={enr.classId} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      <span className="absolute bottom-3 left-4 z-20 font-black text-2xl text-white tracking-wide">{enr.classId}</span>
                   </div>
                   <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                     <p className="text-xs text-slate-400">Class Roll: <span className="font-mono text-emerald-400 block mt-1">{enr.classRoll}</span></p>
                     <button onClick={() => router.push("/dashboard/student/join-classroom")} className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg transition duration-200 flex justify-center items-center gap-2 cursor-pointer transform active:scale-95">
                       <BookOpen size={16} /> Enter Class
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      ) : (
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
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}