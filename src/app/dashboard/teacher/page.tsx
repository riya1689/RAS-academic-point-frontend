"use client"; 
import { useEffect, useState } from "react"; 
import Link from "next/link"; 
import { toast } from "react-hot-toast"; 
import { Plus, Copy, BookOpen, Users, ArrowRight, Wallet, CheckCircle2, Calendar, XCircle } from "lucide-react"; 
import { createClassroom, getTeacherClassrooms } from "../../../lib/classroom.api"; 
import { getSalaryLogs } from "../../../lib/payment.api"; 

export default function TeacherDashboard() { 
  const [activeTab, setActiveTab] = useState<"classroom" | "salary">("classroom"); 
  const [classrooms, setClassrooms] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [newClassTitle, setNewClassTitle] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Salary specific states
  const [salaryLogs, setSalaryLogs] = useState<any[]>([]);
  const [loadingSalary, setLoadingSalary] = useState(false);

  const fetchClassrooms = async () => { 
    try { 
      const data = await getTeacherClassrooms(); 
      setClassrooms(data.classrooms || []); 
    } catch (error: any) { 
      toast.error(error.response?.data?.message || "Failed to load classrooms"); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 

  const fetchSalaryLogs = async () => {
    try {
      setLoadingSalary(true);
      const data = await getSalaryLogs();
      setSalaryLogs(data.salaryLogs || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load salary logs");
    } finally {
      setLoadingSalary(false);
    }
  };

  useEffect(() => { 
    fetchClassrooms(); 
    fetchSalaryLogs();
  }, []); 

  const handleCreateClassroom = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!newClassTitle.trim()) { 
      return toast.error("Please enter a classroom title"); 
    } 
    try { 
      setIsSubmitting(true); 
      await createClassroom(newClassTitle); 
      toast.success("Classroom created successfully!"); 
      setNewClassTitle(""); 
      setIsModalOpen(false); 
      fetchClassrooms(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create classroom"); 
    } finally { 
      setIsSubmitting(false); 
    }
  }; 

  const copyCode = (code: string) => { 
    navigator.clipboard.writeText(code); 
    toast.success(`Classroom code ${code} copied!`);
  }; 

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Teacher Portal</h2>
          <p className="text-slate-400 text-sm mt-1">Manage classrooms, track student attendance, and monitor monthly salary payouts.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer transform hover:scale-[1.02] text-sm">
          <Plus size={18} />
          <span>Create Classroom</span>
        </button>
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
          My Classrooms
        </button>
        <button
          onClick={() => {
            setActiveTab("salary");
            fetchSalaryLogs();
          }}
          className={`px-6 py-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[2px] ${
            activeTab === "salary"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Salary Payout Tracker
        </button>
      </div>

      {activeTab === "classroom" ? (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl">
              <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300">No Classrooms Yet</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6">Create a classroom to start managing attendance and students.</p>
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer">
                <Plus size={16} />
                <span>Create First Class</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {classrooms.map((cls) => (
                <div key={cls.id} className="group relative bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-6 transition duration-200 shadow-xl flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-200"></div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition duration-200 inline-block">
                        <BookOpen size={22} />
                      </span>
                      <div className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-300 cursor-pointer transition" onClick={() => copyCode(cls.classroomCode)}>
                        <span className="font-mono">{cls.classroomCode}</span>
                        <Copy size={12} className="text-slate-400 group-hover:text-slate-200" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold group-hover:text-emerald-400 transition duration-150 mb-2 truncate">{cls.title}</h4>
                    <p className="text-slate-400 text-xs flex items-center mb-6">
                      <Users size={14} className="mr-1.5 text-emerald-500" />
                      <span>{(cls.members || []).length} Students Enrolled</span>
                    </p>
                  </div>
                  <Link href={`/dashboard/teacher/classroom/${cls.id}`} className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800/50 group-hover:bg-emerald-500 hover:!text-slate-950 text-slate-300 font-semibold rounded-xl border border-slate-700/80 group-hover:border-emerald-500 transition duration-200">
                    <span>Enter Classroom</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Salary payout tracking view */
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <Wallet size={20} className="text-emerald-400" />
              <span>Monthly Salary Logs</span>
            </h3>
            <span className="text-slate-400 text-xs">Contracted monthly salary: <b className="text-slate-200">25000 BDT</b></span>
          </div>

          {loadingSalary && salaryLogs.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Month</th>
                      <th className="p-4">Base Payout</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Payout Method</th>
                      <th className="p-4">Reconciliation Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {salaryLogs.map((log) => {
                      const isPaid = log.status === "PAID";
                      const isPending = log.status === "PENDING";
                      const isUnpaid = log.status === "UNPAID";

                      return (
                        <tr key={log.month} className="hover:bg-slate-800/10 transition duration-150">
                          <td className="p-4 font-semibold text-slate-300">{log.month}</td>
                          <td className="p-4 text-slate-300 font-mono">{log.amount} BDT</td>
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
                          <td className="p-4 text-slate-400 font-medium">
                            {isPaid ? (
                              <span className="text-xs uppercase bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300 font-mono">
                                BANK TRANSFER
                              </span>
                            ) : (
                              <span className="text-slate-600 italic text-xs">-</span>
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

      {isModalOpen && ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"> 
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn"> 
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div> 
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Create Classroom</h3> 
            <p className="text-slate-400 text-sm mb-6">Enter a title to create your virtual workspace for students.</p>
            <form onSubmit={handleCreateClassroom} className="space-y-6"> 
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Classroom Title</label> 
                <input type="text" placeholder="e.g. Physics - Class 10 (A)" value={newClassTitle} onChange={(e) => setNewClassTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 placeholder-slate-500 transition duration-200" required disabled={isSubmitting} /> 
              </div> 
              <div className="flex space-x-3"> 
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer" disabled={isSubmitting}> 
                  Cancel
                </button> 
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 cursor-pointer transform active:scale-95" disabled={isSubmitting}> 
                  {isSubmitting ? "Creating..." : "Create Class"}
                </button> 
              </div>  
            </form>   
          </div>   
        </div>  
      )}  
    </div>  
  );  
}
