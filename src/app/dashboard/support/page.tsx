"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getSocket } from "../../../lib/socket";
import {
  createSupportSession,
  getActiveSupportSessions,
  submitSupportTicket,
  getSupportQueue,
  updateTicketStatus
} from "../../../lib/support.api";
import { HelpCircle, Calendar, Clock, Video, Send, CheckCircle2, User, Play, XSquare, Plus, ArrowRight } from "lucide-react";

export default function SupportSessionsPage() {
  const [role, setRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [problemDesc, setProblemDesc] = useState("");
  const [myTicket, setMyTicket] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTime, setSessionTime] = useState("09:00 AM");
  const [meetLink, setMeetLink] = useState("");

  const socket = getSocket();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setRole(u.role);
      setUserId(u.student?.id || u.id);
    }
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getActiveSupportSessions();
      setSessions(data.sessions || []);
      if (data.sessions && data.sessions.length > 0) {
        handleSelectSession(data.sessions[0]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load support sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session: any) => {
    setActiveSession(session);
    socket.connect();
    socket.emit("join-session", session.id);

    try {
      const qData = await getSupportQueue(session.id);
      setQueue(qData.queue || []);
      
      const studentTicket = (qData.queue || []).find((t: any) => t.studentId === userId);
      if (studentTicket) {
        setMyTicket(studentTicket);
      } else {
        setMyTicket(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!activeSession) return;

    const onQueueUpdated = (updatedQueue: any[]) => {
      setQueue(updatedQueue);
      const studentTicket = updatedQueue.find((t: any) => t.studentId === userId);
      if (studentTicket) {
        setMyTicket(studentTicket);
      } else {
        setMyTicket(null);
      }
    };

    const onStudentCalled = (ticket: any) => {
      if (ticket.studentId === userId) {
        toast.success("🚨 Teacher is calling you now! Please join the Google Meet session.", {
          duration: 15000,
          position: "top-center",
        });
        setMyTicket(ticket);
      }
    };

    socket.on("queue-updated", onQueueUpdated);
    socket.on("student-called", onStudentCalled);

    return () => {
      socket.off("queue-updated", onQueueUpdated);
      socket.off("student-called", onStudentCalled);
      socket.emit("leave-session", activeSession.id);
    };
  }, [activeSession, userId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createSupportSession(sessionDate, sessionTime, meetLink);
      toast.success("Support session created successfully!");
      setIsModalOpen(false);
      setMeetLink("");
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDesc.trim()) return toast.error("Please enter problem description");

    try {
      setSubmitting(true);
      const res = await submitSupportTicket(activeSession.id, problemDesc);
      toast.success(`Ticket submitted successfully! Your serial number is ${res.serialNo}`);
      setProblemDesc("");
      setMyTicket({
        studentId: userId,
        problemDesc,
        serialNo: res.serialNo,
        status: "PENDING",
      });
      setQueue(res.queue || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallStudent = async (studentId: string) => {
    try {
      const res = await updateTicketStatus(activeSession.id, studentId, "ACTIVE");
      toast.success("Called student!");
      setQueue(res.queue || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to call student");
    }
  };

  const handleResolveTicket = async (studentId: string) => {
    try {
      const res = await updateTicketStatus(activeSession.id, studentId, "RESOLVED");
      toast.success("Resolved ticket!");
      setQueue(res.queue || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resolve ticket");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent flex items-center">
            <HelpCircle className="mr-2 text-emerald-400" size={32} />
            <span>Support Sessions</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Get real-time assistance from teachers with active question queue tracking.</p>
        </div>
        {role === "TEACHER" && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition transform hover:scale-[1.02] cursor-pointer">
            <Plus size={20} />
            <span>New Support Session</span>
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <Clock className="mx-auto text-slate-600 mb-2" size={48} />
          <h3 className="text-xl font-bold text-slate-300">No Support Session Available Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {role === "STUDENT" 
              ? "Support sessions start daily at 09:00 AM. Please check back later when a teacher is online." 
              : "Create a support session to start taking questions from student queues."}
          </p>
          {role === "TEACHER" && (
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/80 transition cursor-pointer">
              <Plus size={16} />
              <span>Create Session</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {activeSession && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">Active Support Queue</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center">
                      <Clock size={12} className="mr-1.5 text-emerald-500" />
                      <span>Started at {activeSession.time} - Hosted by {activeSession.teacher?.user?.name || "Teacher"}</span>
                    </p>
                  </div>
                  {activeSession.meetLink && (
                    <a href={activeSession.meetLink} target="_blank" rel="noreferrer" className="flex items-center space-x-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition">
                      <Video size={16} />
                      <span>Join Meet Link</span>
                    </a>
                  )}
                </div>

                {role === "STUDENT" ? (
                  <div className="space-y-6">
                    {myTicket ? (
                      <div className="p-6 bg-slate-950/60 border border-emerald-500/30 rounded-xl space-y-4 shadow-inner">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Your Ticket Status</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${myTicket.status === "ACTIVE" ? "bg-emerald-500 text-slate-950 animate-pulse" : "bg-slate-800 text-slate-400"}`}>
                            {myTicket.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-center">
                            <span className="text-slate-500 text-xs block mb-1">Your Serial No</span>
                            <span className="text-3xl font-extrabold text-slate-200">{myTicket.serialNo}</span>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-center">
                            <span className="text-slate-500 text-xs block mb-1">People Ahead</span>
                            <span className="text-3xl font-extrabold text-slate-200">
                              {queue.filter((t: any) => t.serialNo < myTicket.serialNo).length}
                            </span>
                          </div>
                        </div>
                        {myTicket.status === "ACTIVE" && activeSession.meetLink && (
                          <div className="text-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-3">
                            <p className="text-sm text-emerald-300 font-medium">The teacher is waiting for you! Please join Google Meet.</p>
                            <a href={activeSession.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition">
                              <Video size={16} />
                              <span>Join Google Meet</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <h4 className="text-lg font-bold text-slate-300">Submit Your Problem</h4>
                        <div className="space-y-2">
                          <label className="block text-slate-400 text-xs font-semibold">Problem Description</label>
                          <textarea placeholder="Write a short description of the problem you need help with..." value={problemDesc} onChange={(e) => setProblemDesc(e.target.value)} className="w-full h-32 px-4 py-3 bg-slate-800/40 border border-slate-700/80 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 placeholder-slate-500 transition duration-150 resize-none" required disabled={submitting} />
                        </div>
                        <button type="submit" disabled={submitting} className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50 cursor-pointer">
                          <Send size={16} />
                          <span>{submitting ? "Submitting..." : "Submit Problem to Queue"}</span>
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-slate-300 flex items-center">
                      <Clock className="mr-2 text-emerald-400" size={18} />
                      <span>Current Student Queue ({queue.length})</span>
                    </h4>
                    {queue.length === 0 ? (
                      <p className="text-sm text-slate-500 italic text-center py-12 bg-slate-950/25 border border-slate-850 rounded-xl">No student tickets submitted for this session yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-850">
                        {queue.map((ticket) => (
                          <div key={ticket.studentId} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-slate-200">{ticket.name}</span>
                                <span className="text-xs text-slate-500">Roll: {ticket.roll}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ticket.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}`}>
                                  {ticket.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{ticket.problemDesc}</p>
                            </div>
                            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                              <div className="text-center px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-850 font-mono text-sm mr-2">
                                <span className="text-slate-500 text-[10px] block">Serial</span>
                                <span className="font-bold text-emerald-400">{ticket.serialNo}</span>
                              </div>
                              {ticket.status === "PENDING" && (
                                <button onClick={() => handleCallStudent(ticket.studentId)} className="flex items-center space-x-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer">
                                  <Play size={12} />
                                  <span>Call Student</span>
                                </button>
                              )}
                              <button onClick={() => handleResolveTicket(ticket.studentId)} className="flex items-center space-x-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs transition cursor-pointer">
                                <CheckCircle2 size={12} />
                                <span>Resolve</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Active Sessions Today</h3>
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} onClick={() => handleSelectSession(s)} className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-center ${activeSession?.id === s.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-950/30 border-slate-850 hover:border-slate-700"}`}>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-300 block">Support with {s.teacher?.user?.name || "Teacher"}</span>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock size={12} className="mr-1 text-emerald-500" />
                        <span>{s.time}</span>
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">New Support Session</h3>
            <p className="text-slate-400 text-sm mb-6">Schedule or boot up a daily support session for students in active queues.</p>
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Session Date</label>
                <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 transition" required />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Start Time</label>
                <input type="text" placeholder="e.g. 09:00 AM" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 transition" required />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Google Meet Link (Optional)</label>
                <input type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/80 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 transition" />
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700/80 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition cursor-pointer transform active:scale-95">
                  {submitting ? "Creating..." : "Start Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
