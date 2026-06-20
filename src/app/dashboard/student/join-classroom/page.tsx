"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, BookOpen, Calendar, CheckCircle2, XCircle, ArrowRight, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStudentClassrooms, joinClassroom, getStudentAttendance } from "../../../../lib/classroom.api";

export default function JoinClassroomPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchClassrooms = async () => {
    try {
      const data = await getStudentClassrooms();
      setClassrooms(data.classrooms || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load classrooms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      return toast.error("Please enter a classroom code");
    }
    try {
      setIsSubmitting(true);
      await joinClassroom(classCode.toUpperCase());
      toast.success("Successfully joined the classroom!");
      setClassCode("");
      setIsModalOpen(false);
      fetchClassrooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAttendance = async (classroom: any) => {
    setSelectedClassroom(classroom);
    setLoadingAttendance(true);
    try {
      const data = await getStudentAttendance(classroom.id);
      setAttendanceData(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load attendance records");
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Classrooms & Attendance</h2>
          <p className="text-slate-400 text-sm mt-1">Join classrooms using the code provided by your teacher and track your attendance.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => router.push("/dashboard/student")} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer text-sm">
            Back to Dashboard
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-200 cursor-pointer transform hover:scale-[1.02] text-sm">
            <Plus size={18} />
            <span>+ Join classroom</span>
          </button>
        </div>
      </div>

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
                <span>+ Join classroom</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Join Classroom</h3>
            <p className="text-slate-400 text-sm mb-6">Enter the 6-character classroom code provided by your teacher to join.</p>
            <form onSubmit={handleJoinClassroom} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Classroom Code</label>
                <input type="text" placeholder="e.g. AB12CD" maxLength={6} value={classCode} onChange={(e) => setClassCode(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 font-mono placeholder-slate-500 uppercase tracking-widest text-center text-lg transition duration-200" required disabled={isSubmitting} />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition duration-200 cursor-pointer transform active:scale-95" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Join Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
