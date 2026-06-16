"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Plus, Calendar, CheckCircle2, XCircle, BookOpen, 
  User, Award, FileText, ClipboardList, Edit, Trash2, X 
} from "lucide-react";
import { 
  getExams, createExam, uploadResult, getMyResults, getStudentResults, 
  updateExam, updateResult, deleteResult,
  Exam, ResultRecord 
} from "../../../lib/result.api";
import { getStudents, Student } from "../../../lib/payment.api";

export default function ExamResultsPage() {
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin/Teacher specific states
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<"lookup" | "record" | "add_exam">("lookup");

  // Record Form states
  const [recordStudentId, setRecordStudentId] = useState("");
  const [recordExamId, setRecordExamId] = useState("");
  const [recordSubject, setRecordSubject] = useState("");
  const [recordWritten, setRecordWritten] = useState(0);
  const [recordMCQ, setRecordMCQ] = useState(0);
  const [recordPractical, setRecordPractical] = useState<number | "">("");
  const [passWritten, setPassWritten] = useState(40);
  const [passMCQ, setPassMCQ] = useState(15);
  const [passPractical, setPassPractical] = useState<number | "">("");
  const [includePractical, setIncludePractical] = useState(false);

  // Edit Result Modal state
  const [editingResult, setEditingResult] = useState<ResultRecord | null>(null);
  const [editWritten, setEditWritten] = useState(0);
  const [editMCQ, setEditMCQ] = useState(0);
  const [editPractical, setEditPractical] = useState<number | "">("");
  const [editPassWritten, setEditPassWritten] = useState(40);
  const [editPassMCQ, setEditPassMCQ] = useState(15);
  const [editPassPractical, setEditPassPractical] = useState<number | "">("");
  const [editIncludePractical, setEditIncludePractical] = useState(false);

  // Edit Exam state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editExamName, setEditExamName] = useState("");
  const [editExamDate, setEditExamDate] = useState("");

  // Create Exam Form states
  const [newExamName, setNewExamName] = useState("");
  const [newExamDate, setNewExamDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchInitialData(parsedUser);
    }
  }, []);

  const fetchInitialData = async (currentUser: any) => {
    try {
      setLoading(true);
      const examRes = await getExams();
      setExams(examRes.exams || []);
      if (examRes.exams?.length > 0) {
        setSelectedExamId(examRes.exams[0].id);
      }

      if (currentUser.role === "STUDENT") {
        const resData = await getMyResults(examRes.exams[0]?.id);
        setResults(resData.results || []);
      } else if (currentUser.role === "GUARDIAN") {
        // Fetch guardian's student results
        const resData = await getStudentResults(currentUser.studentId || "", examRes.exams[0]?.id);
        setResults(resData.results || []);
      } else if (currentUser.role === "ADMIN" || currentUser.role === "TEACHER") {
        const studentRes = await getStudents();
        setStudents(studentRes.students || []);
        if (studentRes.students?.length > 0) {
          setSelectedStudentId(studentRes.students[0].id);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load academic records");
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when Student/Guardian changes Exam
  const handleExamChange = async (examId: string) => {
    setSelectedExamId(examId);
    if (!examId) return;

    try {
      setLoading(true);
      if (user.role === "STUDENT") {
        const resData = await getMyResults(examId);
        setResults(resData.results || []);
      } else if (user.role === "GUARDIAN") {
        const resData = await getStudentResults(user.studentId || "", examId);
        setResults(resData.results || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when Admin/Teacher changes Student or Exam
  const handleLookupFetch = async (studentId: string, examId: string) => {
    if (!studentId || !examId) return;
    try {
      setLoading(true);
      const resData = await getStudentResults(studentId, examId);
      setResults(resData.results || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch student results");
    } finally {
      setLoading(false);
    }
  };

  // Upload/Record Mark handler
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordStudentId || !recordExamId || !recordSubject) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setIsSubmitting(true);
      await uploadResult({
        studentId: recordStudentId,
        examId: recordExamId,
        subject: recordSubject,
        writtenMark: Number(recordWritten),
        mcqMark: Number(recordMCQ),
        practicalMark: !includePractical || recordPractical === "" ? null : Number(recordPractical),
        writtenPassMark: Number(passWritten),
        mcqPassMark: Number(passMCQ),
        practicalPassMark: !includePractical || passPractical === "" ? null : Number(passPractical)
      });

      toast.success("Marks recorded successfully!");
      // Reset marks fields
      setRecordSubject("");
      setRecordWritten(0);
      setRecordMCQ(0);
      setRecordPractical("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record marks");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Result Modal
  const openEditResultModal = (resRecord: ResultRecord) => {
    setEditingResult(resRecord);
    setEditWritten(resRecord.writtenMark);
    setEditMCQ(resRecord.mcqMark);
    setEditPractical(resRecord.practicalMark !== null ? resRecord.practicalMark : "");
    setEditPassWritten(resRecord.writtenPassMark);
    setEditPassMCQ(resRecord.mcqPassMark);
    setEditPassPractical(resRecord.practicalPassMark !== null ? resRecord.practicalPassMark : "");
    setEditIncludePractical(resRecord.practicalMark !== null);
  };

  // Submit Edited Result
  const handleEditResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    try {
      setIsSubmitting(true);
      await updateResult(editingResult.id, {
        writtenMark: Number(editWritten),
        mcqMark: Number(editMCQ),
        practicalMark: !editIncludePractical || editPractical === "" ? null : Number(editPractical),
        writtenPassMark: Number(editPassWritten),
        mcqPassMark: Number(editPassMCQ),
        practicalPassMark: !editIncludePractical || editPassPractical === "" ? null : Number(editPassPractical)
      });
      toast.success("Result record updated successfully!");
      setEditingResult(null);
      handleLookupFetch(selectedStudentId, selectedExamId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update result");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Result Record
  const handleDeleteResult = async (resultId: string) => {
    if (!window.confirm("Are you sure you want to delete this subject mark record?")) return;

    try {
      await deleteResult(resultId);
      toast.success("Result record deleted successfully!");
      handleLookupFetch(selectedStudentId, selectedExamId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete result");
    }
  };

  // Open Edit Exam Modal
  const openEditExamModal = (exam: Exam) => {
    setEditingExam(exam);
    setEditExamName(exam.name);
    try {
      const formattedDate = new Date(exam.examDate).toISOString().split('T')[0];
      setEditExamDate(formattedDate);
    } catch (err) {
      setEditExamDate("");
    }
  };

  // Submit Edited Exam
  const handleEditExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    try {
      setIsSubmitting(true);
      const data = await updateExam(editingExam.id, {
        name: editExamName,
        examDate: editExamDate
      });
      toast.success("Exam updated successfully!");
      
      // Update local state list
      setExams(exams.map(ex => ex.id === editingExam.id ? data.exam : ex));
      setEditingExam(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Exam handler
  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName || !newExamDate) {
      return toast.error("Please enter exam name and date");
    }

    try {
      setIsSubmitting(true);
      const data = await createExam({
        name: newExamName,
        examDate: newExamDate
      });
      toast.success("New exam created successfully!");
      setExams([data.exam, ...exams]);
      setSelectedExamId(data.exam.id);
      setNewExamName("");
      setNewExamDate("");
      setActiveAdminTab("lookup");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-20 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const isFaculty = user.role === "ADMIN" || user.role === "TEACHER";

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Exam Results Portal</h2>
          <p className="text-slate-400 text-sm mt-1">
            {isFaculty 
              ? "Add exams, publish subject scores, configure thresholds, and look up student transcripts."
              : "Select an exam to view your full transcript and subject performance grades."}
          </p>
        </div>
      </div>

      {/* ADMIN & TEACHER view */}
      {isFaculty && (
        <div className="space-y-6">
          {/* Faculty Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => {
                setActiveAdminTab("lookup");
                setResults([]);
              }}
              className={`px-6 py-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[2px] ${
                activeAdminTab === "lookup"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Student Transcript Lookup
            </button>
            <button
              onClick={() => setActiveAdminTab("record")}
              className={`px-6 py-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[2px] ${
                activeAdminTab === "record"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Record Student Marks
            </button>
            <button
              onClick={() => setActiveAdminTab("add_exam")}
              className={`px-6 py-3 font-semibold text-sm transition duration-150 border-b-2 -mb-[2px] ${
                activeAdminTab === "add_exam"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Add New Exam
            </button>
          </div>

          {/* TAB 1: Lookup Transcript */}
          {activeAdminTab === "lookup" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/25 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      handleLookupFetch(e.target.value, selectedExamId);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.user?.name} (Class: {s.class}, Roll: {s.roll})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">Select Exam</label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      handleLookupFetch(selectedStudentId, e.target.value);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    <option value="">-- Select Exam --</option>
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handleLookupFetch(selectedStudentId, selectedExamId)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl border border-slate-700/80 transition duration-150 cursor-pointer"
                  >
                    Load Transcript
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
                </div>
              ) : results.length === 0 ? (
                <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl py-12 text-center text-slate-500 text-sm">
                  <ClipboardList className="mx-auto mb-3 text-slate-700" size={40} />
                  Select a student and exam to load their transcript.
                </div>
              ) : (
                <>
                  {results[0]?.student && (
                    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-sm mb-4 animate-fadeIn">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                          <User size={22} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-200">{results[0].student.user.name}</h4>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Student Profile Card</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
                        <div>ID: <span className="font-mono text-emerald-400">{results[0].student.id}</span></div>
                        <div>Class: <span className="font-mono text-emerald-400">{results[0].student.class}</span></div>
                        <div>Roll: <span className="font-mono text-emerald-400">{results[0].student.roll}</span></div>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
                  <div className="overflow-x-auto">
                    {(() => {
                      const hasPractical = results.some(r => r.practicalMark !== null && r.practicalMark !== undefined);
                      return (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              <th className="p-4">Subject</th>
                              <th className="p-4">Written Mark</th>
                              <th className="p-4">MCQ Mark</th>
                              {hasPractical && <th className="p-4">Practical Mark</th>}
                              <th className="p-4">Total Score</th>
                              <th className="p-4">Result Status</th>
                              {isFaculty && <th className="p-4">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-sm">
                            {results.map((r) => {
                              const isFail = r.result === "FAIL";
                              return (
                                <tr key={r.id} className={`transition duration-150 ${isFail ? "bg-rose-500/5 hover:bg-rose-500/10" : "hover:bg-slate-800/10"}`}>
                                  <td className="p-4 font-semibold text-slate-350">{r.subject}</td>
                                  <td className="p-4 font-mono text-slate-300">
                                    {r.writtenMark} <span className="text-[10px] text-slate-550">(Pass: {r.writtenPassMark})</span>
                                  </td>
                                  <td className="p-4 font-mono text-slate-300">
                                    {r.mcqMark} <span className="text-[10px] text-slate-550">(Pass: {r.mcqPassMark})</span>
                                  </td>
                                  {hasPractical && (
                                    <td className="p-4 font-mono text-slate-300">
                                      {r.practicalMark !== null ? r.practicalMark : "-"} 
                                      {r.practicalMark !== null && (
                                        <span className="text-[10px] text-slate-550"> (Pass: {r.practicalPassMark || 0})</span>
                                      )}
                                    </td>
                                  )}
                                  <td className="p-4 font-mono font-bold text-slate-200">{r.totalMark} Marks</td>
                                  <td className="p-4">
                                    {isFail ? (
                                      <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                                        <XCircle size={12} />
                                        <span>Fail</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                        <CheckCircle2 size={12} />
                                        <span>Pass</span>
                                      </span>
                                    )}
                                  </td>
                                  {isFaculty && (
                                    <td className="p-4">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => openEditResultModal(r)}
                                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition duration-150 cursor-pointer"
                                          title="Edit Marks"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteResult(r.id)}
                                          className="p-1.5 text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 rounded transition duration-150 cursor-pointer"
                                          title="Delete Marks"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: Record Student Marks */}
          {activeAdminTab === "record" && (
            <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto backdrop-blur-md animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-emerald-400" />
                <span>Upload Student Marks</span>
              </h3>

              <form onSubmit={handleRecordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Select Student *</label>
                    <select
                      value={recordStudentId}
                      onChange={(e) => setRecordStudentId(e.target.value)}
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
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Select Exam *</label>
                    <select
                      value={recordExamId}
                      onChange={(e) => setRecordExamId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                      required
                    >
                      <option value="">-- Select Exam --</option>
                      {exams.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Subject Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics, Bangla, English"
                      value={recordSubject}
                      onChange={(e) => setRecordSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 my-2 bg-slate-800/20 p-3 rounded-xl border border-slate-850">
                  <input
                    type="checkbox"
                    id="includePractical"
                    checked={includePractical}
                    onChange={(e) => setIncludePractical(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="includePractical" className="text-slate-350 text-xs font-semibold cursor-pointer select-none">
                    Include Practical Marks Column
                  </label>
                </div>

                <hr className="border-slate-800 my-4" />

                <div className={`grid ${includePractical ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Written Score *</label>
                    <input
                      type="number"
                      value={recordWritten}
                      onChange={(e) => setRecordWritten(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">MCQ Score *</label>
                    <input
                      type="number"
                      value={recordMCQ}
                      onChange={(e) => setRecordMCQ(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                      required
                    />
                  </div>
                  {includePractical && (
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">Practical Score (Optional)</label>
                      <input
                        type="number"
                        placeholder="N/A"
                        value={recordPractical}
                        onChange={(e) => setRecordPractical(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className={`grid ${includePractical ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Written Pass Mark</label>
                    <input
                      type="number"
                      value={passWritten}
                      onChange={(e) => setPassWritten(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-300 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">MCQ Pass Mark</label>
                    <input
                      type="number"
                      value={passMCQ}
                      onChange={(e) => setPassMCQ(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-300 text-xs"
                      required
                    />
                  </div>
                  {includePractical && (
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Practical Pass Mark</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={passPractical}
                        onChange={(e) => setPassPractical(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-300 text-xs"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl transition duration-150 shadow-md cursor-pointer mt-4"
                >
                  {isSubmitting ? "Publishing Marks..." : "Publish Subject Marks"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Add New Exam / Manage Exams */}
          {activeAdminTab === "add_exam" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Create Exam */}
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-400" />
                  <span>Create New Exam</span>
                </h3>

                <form onSubmit={handleCreateExamSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Exam Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. First Term Board Exam, Midterm 2026"
                      value={newExamName}
                      onChange={(e) => setNewExamName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1.5">Exam Date *</label>
                    <input
                      type="date"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold py-3 rounded-xl transition duration-150 shadow-md cursor-pointer mt-2"
                  >
                    {isSubmitting ? "Creating..." : "Create Exam"}
                  </button>
                </form>
              </div>

              {/* Existing Exams (Edit Only) */}
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md animate-fadeIn">
                <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <Award size={20} className="text-emerald-400" />
                  <span>Existing Exams (Edit Only)</span>
                </h3>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                  {exams.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-10">No exams created yet.</p>
                  ) : (
                    exams.map((ex) => (
                      <div 
                        key={ex.id} 
                        className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition duration-150"
                      >
                        <div>
                          <p className="font-semibold text-slate-205 text-sm">{ex.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {new Date(ex.examDate).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => openEditExamModal(ex)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition duration-150 cursor-pointer"
                          title="Edit Exam Name/Date"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT & GUARDIAN view */}
      {!isFaculty && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2">
              <Award size={20} className="text-emerald-400" />
              <span>Academic Transcript</span>
            </h3>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 text-xs font-medium">Select Exam:</span>
              <select
                value={selectedExamId}
                onChange={(e) => handleExamChange(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl">
              <ClipboardList className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300">No Results Found</h3>
              <p className="text-slate-500 text-sm mt-1">No exam result records have been uploaded for this exam session yet.</p>
            </div>
          ) : (
            <>
              {results[0]?.student && (
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-sm mb-4 animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <User size={22} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-200">{results[0].student.user.name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Student Profile Card</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
                    <div>ID: <span className="font-mono text-emerald-400">{results[0].student.id}</span></div>
                    <div>Class: <span className="font-mono text-emerald-400">{results[0].student.class}</span></div>
                    <div>Roll: <span className="font-mono text-emerald-400">{results[0].student.roll}</span></div>
                  </div>
                </div>
              )}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                {(() => {
                  const hasPractical = results.some(r => r.practicalMark !== null && r.practicalMark !== undefined);
                  return (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="p-4">Subject</th>
                          <th className="p-4">Written Score</th>
                          <th className="p-4">MCQ Score</th>
                          {hasPractical && <th className="p-4">Practical Score</th>}
                          <th className="p-4">Total Mark</th>
                          <th className="p-4 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {results.map((r) => {
                          const isFail = r.result === "FAIL";

                          return (
                            <tr key={r.id} className={`transition duration-150 ${isFail ? "bg-rose-500/5 hover:bg-rose-500/10" : "hover:bg-slate-800/10"}`}>
                              <td className="p-4 font-semibold text-slate-300">{r.subject}</td>
                              <td className="p-4 font-mono text-slate-355">
                                {r.writtenMark} <span className="text-[10px] text-slate-600">(Pass: {r.writtenPassMark})</span>
                              </td>
                              <td className="p-4 font-mono text-slate-355">
                                {r.mcqMark} <span className="text-[10px] text-slate-600">(Pass: {r.mcqPassMark})</span>
                              </td>
                              {hasPractical && (
                                <td className="p-4 font-mono text-slate-355">
                                  {r.practicalMark !== null ? r.practicalMark : "-"}
                                  {r.practicalMark !== null && (
                                    <span className="text-[10px] text-slate-600"> (Pass: {r.practicalPassMark})</span>
                                  )}
                                </td>
                              )}
                              <td className="p-4 font-mono text-slate-200 font-bold">{r.totalMark} Marks</td>
                              <td className="p-4 text-right">
                                {isFail ? (
                                  <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                                    <XCircle size={12} />
                                    <span>Fail</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                    <CheckCircle2 size={12} />
                                    <span>Pass</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
            </>
          )}
        </div>
      )}

      {/* Edit Result Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full relative animate-fadeIn">
            <button
              onClick={() => setEditingResult(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Edit size={20} className="text-emerald-400" />
              <span>Edit Subject Score</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              Updating scores for <span className="text-emerald-400 font-semibold">{editingResult.subject}</span>
            </p>

            <form onSubmit={handleEditResultSubmit} className="space-y-4">
              <div className="flex items-center space-x-2 my-2 bg-slate-850/20 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  id="editIncludePractical"
                  checked={editIncludePractical}
                  onChange={(e) => setEditIncludePractical(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label htmlFor="editIncludePractical" className="text-slate-350 text-xs font-semibold cursor-pointer select-none">
                  Include Practical Column
                </label>
              </div>

              <div className={`grid ${editIncludePractical ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Written *</label>
                  <input
                    type="number"
                    value={editWritten}
                    onChange={(e) => setEditWritten(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">MCQ *</label>
                  <input
                    type="number"
                    value={editMCQ}
                    onChange={(e) => setEditMCQ(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                {editIncludePractical && (
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Practical</label>
                    <input
                      type="number"
                      placeholder="N/A"
                      value={editPractical}
                      onChange={(e) => setEditPractical(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className={`grid ${editIncludePractical ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Written Pass</label>
                  <input
                    type="number"
                    value={editPassWritten}
                    onChange={(e) => setEditPassWritten(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">MCQ Pass</label>
                  <input
                    type="number"
                    value={editPassMCQ}
                    onChange={(e) => setEditPassMCQ(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-300 text-xs"
                    required
                  />
                </div>
                {editIncludePractical && (
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Practical Pass</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={editPassPractical}
                      onChange={(e) => setEditPassPractical(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-300 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl transition duration-150 shadow-md cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative animate-fadeIn">
            <button
              onClick={() => setEditingExam(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Edit size={20} className="text-emerald-400" />
              <span>Edit Exam</span>
            </h3>

            <form onSubmit={handleEditExamSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Exam Name *</label>
                <input
                  type="text"
                  value={editExamName}
                  onChange={(e) => setEditExamName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Exam Date *</label>
                <input
                  type="date"
                  value={editExamDate}
                  onChange={(e) => setEditExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  required
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 rounded-xl transition duration-150 shadow-md cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
