"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getMyEnrollments } from "../../../../lib/payment.api";
import { BookOpen, Calendar, CreditCard, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EnrolledClassesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const data = await getMyEnrollments();
        setEnrollments(data.enrollments || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load enrolled classes.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Enrolled Classes</h2>
          <p className="text-slate-400 text-sm mt-1">View your premium class enrollments, purchase history, and invoices.</p>
        </div>
        <button onClick={() => router.push("/dashboard/student")} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition duration-150">
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            {enrollments.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                <BookOpen className="mx-auto mb-4 text-slate-600" size={48} />
                <p>No premium class enrollments found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Class Target</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Invoice Number</th>
                    <th className="p-4">Date of Purchase</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4 font-bold text-slate-200 text-lg flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><BookOpen size={18} /></span>
                        {enr.classId}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">{enr.transactionId}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{enr.invoiceNumber}</td>
                      <td className="p-4 text-slate-350">
                        {new Date(enr.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">{enr.amountPaid} BDT</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
