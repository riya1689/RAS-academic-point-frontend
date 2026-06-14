"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Plus, CheckCircle2, XCircle, Calendar, Wallet, 
  DollarSign, Users, Search, User, Filter 
} from "lucide-react";
import { 
  getStudents, getTeachers, getTuitionAll, getSalaryAll, 
  recordManualTuition, payTeacherSalary, 
  Student, Teacher, TuitionPaymentRecord, SalaryRecord 
} from "../../../lib/payment.api";

export default function AdminPaymentDashboard() {
  const [activeTab, setActiveTab] = useState<"tuition" | "salary">("tuition");
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tuitionRecords, setTuitionRecords] = useState<TuitionPaymentRecord[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [tuitionMonth, setTuitionMonth] = useState("January");
  const [tuitionAmount, setTuitionAmount] = useState(1500);
  const [tuitionStatus, setTuitionStatus] = useState<"PAID" | "PENDING" | "UNPAID">("PAID");

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [salaryMonth, setSalaryMonth] = useState("January");
  const [salaryAmount, setSalaryAmount] = useState(25000);
  const [salaryStatus, setSalaryStatus] = useState<"PAID" | "PENDING">("PAID");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const MONTHS_LIST = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stuRes, teaRes, tuiRes, salRes] = await Promise.all([
        getStudents(),
        getTeachers(),
        getTuitionAll(),
        getSalaryAll()
      ]);
      setStudents(stuRes.students || []);
      setTeachers(teaRes.teachers || []);
      setTuitionRecords(tuiRes.payments || []);
      setSalaryRecords(salRes.salaries || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load financial records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleManualTuitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      return toast.error("Please select a student");
    }
    try {
      setIsSubmitting(true);
      await recordManualTuition({
        studentId: selectedStudentId,
        month: tuitionMonth,
        amount: Number(tuitionAmount),
        status: tuitionStatus
      });
      toast.success("Tuition fee recorded successfully!");
      setIsTuitionModalOpen(false);
      // Reset form
      setSelectedStudentId("");
      setTuitionMonth("January");
      setTuitionAmount(1500);
      setTuitionStatus("PAID");
      loadAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record manual tuition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      return toast.error("Please select a teacher");
    }
    try {
      setIsSubmitting(true);
      await payTeacherSalary({
        teacherId: selectedTeacherId,
        month: salaryMonth,
        amount: Number(salaryAmount),
        status: salaryStatus
      });
      toast.success("Salary payout record created successfully!");
      setIsSalaryModalOpen(false);
      // Reset form
      setSelectedTeacherId("");
      setSalaryMonth("January");
      setSalaryAmount(25000);
      setSalaryStatus("PAID");
      loadAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to disburse salary");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Tuition Records
  const filteredTuition = tuitionRecords.filter(record => {
    const studentName = record.student?.user?.name || "";
    const studentEmail = record.student?.user?.email || "";
    const matchesSearch = 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.month.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Salary Records
  const filteredSalary = salaryRecords.filter(record => {
    const teacherName = record.teacher?.user?.name || "";
    const teacherEmail = record.teacher?.user?.email || "";
    const matchesSearch = 
      teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacherEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.month.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregated Stats
  const totalFeesCollected = tuitionRecords
    .filter(r => r.status === "PAID")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingFees = tuitionRecords
    .filter(r => r.status === "PENDING")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalSalariesPaid = salaryRecords
    .filter(r => r.status === "PAID")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Reconciliation & Payments</h2>
          <p className="text-slate-400 text-sm mt-1">Record student cash collections, issue teacher salary payments, and audit all financial transactions.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsTuitionModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            <Plus size={16} />
            <span>Record Cash Payment</span>
          </button>
          <button 
            onClick={() => setIsSalaryModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            <Plus size={16} />
            <span>Pay Teacher Salary</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800/85 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs block font-medium">Total Fees Collected</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">{totalFeesCollected} BDT</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/85 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs block font-medium">Pending Payments Verification</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">{pendingFees} BDT</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/85 p-6 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400">
            <Wallet size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs block font-medium">Total Teacher Salary Payouts</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">{totalSalariesPaid} BDT</span>
          </div>
        </div>
      </div>

      {/* Filter and tab bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-800 pb-2">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab("tuition");
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className={`pb-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[10px] ${
              activeTab === "tuition"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Tuition Fee Ledger
          </button>
          <button
            onClick={() => {
              setActiveTab("salary");
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className={`pb-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[10px] ${
              activeTab === "salary"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Teacher Salary Ledger
          </button>
        </div>

        {/* Searching & Filtering Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search logs by name or month...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 placeholder-slate-500 transition duration-150"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Filter size={12} />
              <span>Status:</span>
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL">All States</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
      ) : activeTab === "tuition" ? (
        /* Student Tuition Records Table */
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredTuition.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No tuition payment records found matching the criteria.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Student</th>
                    <th className="p-4">Class/Roll</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredTuition.map((record) => {
                    const isPaid = record.status === "PAID";
                    const isPending = record.status === "PENDING";
                    const isUnpaid = record.status === "UNPAID";

                    return (
                      <tr key={record.id} className="hover:bg-slate-800/10 transition duration-150">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
                              <User size={16} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">{record.student?.user?.name || "Academic Student"}</div>
                              <div className="text-xs text-slate-400">{record.student?.user?.email || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-300 font-medium">Class: {record.student?.class || "-"}</div>
                          <div className="text-xs text-slate-500">Roll: {record.student?.roll || "-"}</div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">{record.month}</td>
                        <td className="p-4 font-mono text-slate-300">{record.amount} BDT</td>
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
                              <span>Pending Verification</span>
                            </span>
                          )}
                          {isUnpaid && (
                            <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                              <XCircle size={12} />
                              <span>Unpaid</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {record.paymentMethod ? (
                            <span className="text-[10px] tracking-wider uppercase bg-slate-800/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                              {record.paymentMethod}
                            </span>
                          ) : (
                            <span className="text-slate-650 italic text-xs">-</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-xs">
                          {record.paymentDate
                            ? new Date(record.paymentDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Teacher Salary Records Table */
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredSalary.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No teacher salary payment records found matching the criteria.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Dept / ID</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Disbursed Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payout Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredSalary.map((record) => {
                    const isPaid = record.status === "PAID";
                    const isPending = record.status === "PENDING";
                    const isUnpaid = record.status === "UNPAID";

                    return (
                      <tr key={record.id} className="hover:bg-slate-800/10 transition duration-150">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
                              <User size={16} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">{record.teacher?.user?.name || "Academic Teacher"}</div>
                              <div className="text-xs text-slate-400">{record.teacher?.user?.email || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-300 font-medium">{record.teacher?.department || "-"}</div>
                          <div className="text-xs text-slate-500">ID: {record.teacher?.teacherId || "-"}</div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">{record.month}</td>
                        <td className="p-4 font-mono text-slate-300">{record.amount} BDT</td>
                        <td className="p-4">
                          {isPaid && (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                              <CheckCircle2 size={12} />
                              <span>Disbursed</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold text-xs bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                              <Calendar size={12} />
                              <span>Awaiting Disbursal</span>
                            </span>
                          )}
                          {isUnpaid && (
                            <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                              <XCircle size={12} />
                              <span>Unpaid</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-xs">
                          {record.paymentDate
                            ? new Date(record.paymentDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Record Cash Payment Modal */}
      {isTuitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Record Cash Payment</h3>
            <p className="text-slate-400 text-sm mb-6">Record a manual tuition fee cash adjustment for a student.</p>
            
            <form onSubmit={handleManualTuitionSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.user?.name} (Class: {s.class}, Roll: {s.roll})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Billing Month</label>
                  <select
                    value={tuitionMonth}
                    onChange={(e) => setTuitionMonth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Amount (BDT)</label>
                  <input
                    type="number"
                    value={tuitionAmount}
                    onChange={(e) => setTuitionAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Payment Status</label>
                <select
                  value={tuitionStatus}
                  onChange={(e) => setTuitionStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTuitionModalOpen(false)} 
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-800/80 text-slate-300 font-semibold rounded-xl border border-slate-755/80 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-205 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Salary Disbursal Modal */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Pay Teacher Salary</h3>
            <p className="text-slate-400 text-sm mb-6">Create a teacher monthly salary payout disbursement record.</p>
            
            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name} (Dept: {t.department}, ID: {t.teacherId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Salary Month</label>
                  <select
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Amount (BDT)</label>
                  <input
                    type="number"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Payout Status</label>
                <select
                  value={salaryStatus}
                  onChange={(e) => setSalaryStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                >
                  <option value="PAID">Disbursed / Paid</option>
                  <option value="PENDING">Pending Awaiting Disbursal</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsSalaryModalOpen(false)} 
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-800/80 text-slate-300 font-semibold rounded-xl border border-slate-755/80 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition duration-205 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Disbursing..." : "Disburse Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
