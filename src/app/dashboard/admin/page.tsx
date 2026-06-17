"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Plus, CheckCircle2, XCircle, Calendar, Wallet,
  DollarSign, Users, Search, User, Filter, Edit2, Trash2,
  BookOpen, Shield, HelpCircle, FileText, Trophy, Smile,
  ArrowUpRight, Award, Trash, Ban, Check, X, ShieldAlert, GraduationCap
} from "lucide-react";

// APIs
import {
  getAdminStats, getAdminUsers, updateAdminUser,
  getAdminStudents, createAdminStudent, updateAdminStudent, deleteAdminStudent,
  getAdminTeachers, createAdminTeacher, updateAdminTeacher, deleteAdminTeacher,
  getAdminSupportSessions, createAdminSupportSession, cancelAdminSupportSession,
  getAdminBookings, cancelAdminBooking,
  getFinanceDetails,
  getSatisfactionRatings,
  getExamAttendanceStats,
  getAdminClassrooms, createAdminClassroom, deleteAdminClassroom,
  AdminStats, AdminUser, AdminStudent, AdminTeacher, AdminClassroom,
  SupportSession, SupportStats, OneToOneBooking, SatisfactionRating, FinanceDetails, GrowthChartData, ExamAttendanceStat
} from "../../../lib/admin.api";

import {
  recordManualTuition, payTeacherSalary,
  TuitionPaymentRecord, SalaryRecord,
  getTuitionAll, getSalaryAll
} from "../../../lib/payment.api";

type TabType = "overview" | "students" | "teachers" | "support" | "one-to-one" | "users" | "revenue" | "exams" | "results" | "payments" | "satisfaction";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") || "overview") as TabType;

  const [loading, setLoading] = useState(true);

  // States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [attendanceChart, setAttendanceChart] = useState<any[]>([]);
  const [resultSuccessChart, setResultSuccessChart] = useState<{ pass: number; fail: number }>({ pass: 0, fail: 0 });
  const [recentActivities, setRecentActivities] = useState<string[]>([]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [classrooms, setClassrooms] = useState<AdminClassroom[]>([]);
  const [supportSessions, setSupportSessions] = useState<SupportSession[]>([]);
  const [supportStats, setSupportStats] = useState<SupportStats | null>(null);
  const [bookings, setBookings] = useState<OneToOneBooking[]>([]);
  
  const [finance, setFinance] = useState<FinanceDetails | null>(null);
  const [growthChart, setGrowthChart] = useState<GrowthChartData[]>([]);
  const [tuitionRecords, setTuitionRecords] = useState<TuitionPaymentRecord[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [financeSubTab, setFinanceSubTab] = useState<"tuition" | "salary">("tuition");

  const [satisfaction, setSatisfaction] = useState<SatisfactionRating[]>([]);
  const [satisfactionTrend, setSatisfactionTrend] = useState<any[]>([]);
  const [satisfactionClass, setSatisfactionClass] = useState("08");

  const [examAttendanceStats, setExamAttendanceStats] = useState<ExamAttendanceStat[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("08"); // defaults to class 8 as per wireframe
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Modals & Selected items
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);

  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null);

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Forms
  const [studentForm, setStudentForm] = useState({
    name: "", email: "", password: "", phone: "", class: "08", roll: "", department: "General", schoolName: "RAS Academic School", year: "2026"
  });

  const [editStudentForm, setEditStudentForm] = useState({
    name: "", email: "", role: "STUDENT", status: "ACTIVE", class: "08", roll: "", department: "General", schoolName: "RAS Academic School", phone: "", year: "2026"
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "", email: "", password: "", teacherId: "", department: "", qualification: "", subject: "", salary: 40000
  });

  const [editTeacherForm, setEditTeacherForm] = useState({
    name: "", email: "", role: "TEACHER", status: "ACTIVE", department: "", qualification: "", subject: "", salary: 40000, rating: 4.5
  });

  const [sessionForm, setSessionForm] = useState({
    teacherId: "", date: "", time: "", subject: "Bangla", duration: 45, totalJoinStudent: 0
  });

  const [userForm, setUserForm] = useState({
    name: "", email: "", role: "STUDENT" as any, status: "ACTIVE" as any
  });

  const [tuitionForm, setTuitionForm] = useState({
    studentId: "", month: "January", amount: 1500, status: "PAID" as any
  });

  const [salaryForm, setSalaryForm] = useState({
    teacherId: "", month: "January", amount: 25000, status: "PAID" as any
  });

  const MONTHS_LIST = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch data based on active tab or fetch all initially
      const [statsRes, usersRes, studentsRes, teachersRes, classroomsRes, sessionsRes, bookingsRes, financeRes, satisfactionRes, examStatsRes, tuitionRes, salaryRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminStudents(),
        getAdminTeachers(),
        getAdminClassrooms(),
        getAdminSupportSessions(),
        getAdminBookings(),
        getFinanceDetails(),
        getSatisfactionRatings(satisfactionClass),
        getExamAttendanceStats(),
        getTuitionAll(),
        getSalaryAll()
      ]);

      setStats(statsRes.stats);
      setAttendanceChart(statsRes.charts.attendanceRateChart || []);
      setResultSuccessChart(statsRes.charts.resultSuccessChart || { pass: 0, fail: 0 });
      setRecentActivities(statsRes.recentActivities || []);

      setUsers(usersRes.users || []);
      setStudents(studentsRes.students || []);
      setTeachers(teachersRes.teachers || []);
      setClassrooms(classroomsRes.classrooms || []);
      
      setSupportSessions(sessionsRes.sessions || []);
      setSupportStats(sessionsRes.stats || null);
      
      setBookings(bookingsRes.bookings || []);
      
      setFinance(financeRes.finance || null);
      setGrowthChart(financeRes.growthChart || []);

      setSatisfaction(satisfactionRes.satisfaction || []);
      setSatisfactionTrend(satisfactionRes.trend || []);

      setExamAttendanceStats(examStatsRes.stats || []);

      setTuitionRecords(tuitionRes.payments || []);
      setSalaryRecords(salaryRes.salaries || []);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to sync administrative panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    // Reload satisfaction ratings if class dropdown changes
    const fetchSatisfaction = async () => {
      try {
        const res = await getSatisfactionRatings(satisfactionClass);
        setSatisfaction(res.satisfaction || []);
        setSatisfactionTrend(res.trend || []);
      } catch (err) {}
    };
    fetchSatisfaction();
  }, [satisfactionClass]);

  // Actions
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createAdminStudent(studentForm);
      toast.success("Student added successfully!");
      setIsAddStudentOpen(false);
      // Reset form
      setStudentForm({ name: "", email: "", password: "", phone: "", class: "08", roll: "", department: "General", schoolName: "RAS Academic School", year: "2026" });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create student profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      setIsSubmitting(true);
      await updateAdminStudent(selectedStudent.id, editStudentForm);
      toast.success("Student profile updated");
      setIsEditStudentOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStudentStatus = async (student: AdminStudent, newStatus: string) => {
    try {
      await updateAdminStudent(student.id, {
        name: student.user.name,
        email: student.user.email,
        role: student.user.role,
        status: newStatus,
        class: student.class,
        roll: student.roll,
        department: student.department,
        schoolName: student.schoolName,
        phone: student.phone,
        year: student.year
      });
      toast.success(`Student status changed to ${newStatus}`);
      loadData();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student and their login credentials?")) return;
    try {
      await deleteAdminStudent(studentId);
      toast.success("Student deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error("Failed to delete student");
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createAdminTeacher(teacherForm);
      toast.success("Teacher added successfully!");
      setIsAddTeacherOpen(false);
      setTeacherForm({ name: "", email: "", password: "", teacherId: "", department: "", qualification: "", subject: "", salary: 40000 });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create teacher profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      setIsSubmitting(true);
      await updateAdminTeacher(selectedTeacher.id, editTeacherForm);
      toast.success("Teacher profile updated");
      setIsEditTeacherOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update teacher profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTeacherStatus = async (teacher: AdminTeacher, newStatus: string) => {
    try {
      await updateAdminTeacher(teacher.id, {
        name: teacher.user.name,
        email: teacher.user.email,
        role: teacher.user.role,
        status: newStatus,
        department: teacher.department,
        qualification: teacher.qualification,
        subject: teacher.subject,
        salary: teacher.salary,
        rating: teacher.rating
      });
      toast.success(`Teacher status changed to ${newStatus}`);
      loadData();
    } catch (error: any) {
      toast.error("Failed to update teacher status");
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to delete this teacher and their login credentials?")) return;
    try {
      await deleteAdminTeacher(teacherId);
      toast.success("Teacher profile deleted");
      loadData();
    } catch (error: any) {
      toast.error("Failed to delete teacher");
    }
  };

  const handleAddSupportSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createAdminSupportSession(sessionForm);
      toast.success("Support session scheduled successfully!");
      setIsAddSessionOpen(false);
      setSessionForm({ teacherId: "", date: "", time: "", subject: "Bangla", duration: 45, totalJoinStudent: 0 });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule support session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSupportSession = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled support session?")) return;
    try {
      await cancelAdminSupportSession(id);
      toast.success("Support session cancelled");
      loadData();
    } catch (error: any) {
      toast.error("Failed to cancel support session");
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this 1-to-1 support session booking?")) return;
    try {
      await cancelAdminBooking(id);
      toast.success("Booking cancelled and slot freed!");
      loadData();
    } catch (error: any) {
      toast.error("Failed to cancel booking");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await updateAdminUser(selectedUser.id, userForm);
      toast.success("User settings updated");
      setIsEditUserOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualTuitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await recordManualTuition(tuitionForm);
      toast.success("Tuition fee logged successfully!");
      setIsTuitionModalOpen(false);
      setTuitionForm({ studentId: "", month: "January", amount: 1500, status: "PAID" });
      loadData();
    } catch (error: any) {
      toast.error("Failed to log payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await payTeacherSalary(salaryForm);
      toast.success("Salary payout logged successfully!");
      setIsSalaryModalOpen(false);
      setSalaryForm({ teacherId: "", month: "January", amount: 25000, status: "PAID" });
      loadData();
    } catch (error: any) {
      toast.error("Failed to disburse salary");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate helper functions
  const triggerEditStudent = (student: AdminStudent) => {
    setSelectedStudent(student);
    setEditStudentForm({
      name: student.user.name,
      email: student.user.email,
      role: student.user.role,
      status: student.user.status,
      class: student.class,
      roll: student.roll,
      department: student.department,
      schoolName: student.schoolName,
      phone: student.phone,
      year: student.year
    });
    setIsEditStudentOpen(true);
  };

  const triggerEditTeacher = (teacher: AdminTeacher) => {
    setSelectedTeacher(teacher);
    setEditTeacherForm({
      name: teacher.user.name,
      email: teacher.user.email,
      role: teacher.user.role,
      status: teacher.user.status,
      department: teacher.department,
      qualification: teacher.qualification,
      subject: teacher.subject,
      salary: teacher.salary,
      rating: teacher.rating
    });
    setIsEditTeacherOpen(true);
  };

  const triggerEditUser = (usr: AdminUser) => {
    setSelectedUser(usr);
    setUserForm({
      name: usr.name,
      email: usr.email,
      role: usr.role,
      status: usr.status
    });
    setIsEditUserOpen(true);
  };

  // Filters applying
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery);

    const matchesClass = classFilter === "ALL" || student.class === classFilter;
    const matchesYear = yearFilter === "ALL" || student.year === yearFilter;
    const matchesStatus = statusFilter === "ALL" || student.user.status === statusFilter;

    return matchesSearch && matchesClass && matchesYear && matchesStatus;
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || teacher.user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSessions = supportSessions.filter(session => {
    return (
      session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.teacher?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredBookings = bookings.filter(b => {
    return (
      (b.student?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.slot?.teacher?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = statusFilter === "ALL" || u.role === statusFilter;
    return matchesSearch && matchesRole;
  });

  // Unique lists for dropdown filters
  const classesList = Array.from(new Set(students.map(s => s.class))).filter(Boolean);
  const yearsList = Array.from(new Set(students.map(s => s.year))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="text-slate-400 text-sm font-semibold animate-pulse">Syncing Admin Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Title bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent capitalize tracking-tight flex items-center gap-2">
            <Shield size={24} className="text-emerald-400" />
            <span>Admin Control Desk: {activeTab === "one-to-one" ? "1-to-1 Support" : activeTab === "payments" ? "Salary & Payment" : activeTab}</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Management, Analytics auditing, and system operations.</p>
        </div>
        
        {/* Quick button displays based on active tab */}
        <div className="flex flex-wrap gap-2">
          {activeTab === "students" && (
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer text-xs"
            >
              <Plus size={14} />
              <span>Add Student</span>
            </button>
          )}
          {activeTab === "teachers" && (
            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer text-xs"
            >
              <Plus size={14} />
              <span>Add Teacher</span>
            </button>
          )}
          {activeTab === "support" && (
            <button
              onClick={() => setIsAddSessionOpen(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer text-xs"
            >
              <Plus size={14} />
              <span>Schedule Session</span>
            </button>
          )}
          {activeTab === "revenue" && (
            <button
              onClick={() => setIsTuitionModalOpen(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer text-xs"
            >
              <Plus size={14} />
              <span>Record Cash tuition</span>
            </button>
          )}
          {activeTab === "payments" && (
            <button
              onClick={() => setIsSalaryModalOpen(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer text-xs"
            >
              <Plus size={14} />
              <span>Disburse Salary</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER PANE (For dynamic tabs) */}
      {activeTab !== "overview" && activeTab !== "revenue" && activeTab !== "satisfaction" && activeTab !== "exams" && (
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/80">
          <div className="relative w-full sm:flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 placeholder-slate-500 transition duration-150"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {activeTab === "students" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Class:</span>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer font-semibold"
                  >
                    <option value="ALL">All</option>
                    {classesList.map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Year:</span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer font-semibold"
                  >
                    <option value="ALL">All</option>
                    {yearsList.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {(activeTab === "students" || activeTab === "teachers") && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer font-semibold"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            )}

            {activeTab === "users" && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Role:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer font-semibold"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW PANEL */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics grids */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition duration-150">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Students</span>
              <span className="text-3xl font-black text-slate-100 font-mono mt-2">{stats.totalStudents}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition duration-150">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Teachers</span>
              <span className="text-3xl font-black text-slate-100 font-mono mt-2">{stats.totalTeachers}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition duration-150">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Support Sessions</span>
              <span className="text-3xl font-black text-slate-100 font-mono mt-2">{stats.totalSupportSessions}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition duration-150">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Revenue</span>
              <span className="text-3xl font-black text-emerald-400 font-mono mt-2">${stats.totalRevenue}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition duration-150">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Due Salary</span>
              <span className="text-3xl font-black text-rose-400 font-mono mt-2">${stats.dueSalary}</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Chart */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Attendance Rate Chart</h3>
              <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/80 pb-2">
                {attendanceChart.length === 0 ? (
                  <div className="w-full text-center py-20 text-slate-500 text-xs">No classroom attendance records.</div>
                ) : (
                  attendanceChart.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                      <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded transition duration-100 z-10 font-mono">
                        {item.rate}%
                      </div>
                      <div 
                        style={{ height: `${item.rate}%` }} 
                        className="w-full bg-gradient-to-t from-emerald-500/80 to-teal-400/90 hover:to-emerald-400 hover:shadow-lg rounded-t-lg transition-all duration-300 min-h-[5px]"
                      ></div>
                      <span className="text-[10px] font-bold text-slate-500 truncate max-w-full mt-2 font-mono">{item.code}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Result Success Chart */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Result Success Chart (PASS/FAIL)</h3>
              <div className="h-64 flex flex-col justify-center items-center gap-6">
                {resultSuccessChart.pass === 0 && resultSuccessChart.fail === 0 ? (
                  <span className="text-slate-500 text-xs font-semibold">No results logged in system.</span>
                ) : (
                  <>
                    {/* Circle bar */}
                    <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-slate-950 border-4 border-rose-500/30">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent border-r-transparent animate-spin-slow"></div>
                      <div className="text-center">
                        <span className="text-2xl font-black text-slate-100 font-mono">
                          {Math.round((resultSuccessChart.pass / (resultSuccessChart.pass + resultSuccessChart.fail)) * 100)}%
                        </span>
                        <span className="block text-[10px] font-bold uppercase text-slate-500 mt-0.5">Success Rate</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex gap-6 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                        <span className="text-slate-300 font-semibold">{resultSuccessChart.pass} Passed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                        <span className="text-slate-300 font-semibold">{resultSuccessChart.fail} Failed</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Active status counts and info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students Status</h4>
              <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-sm text-slate-300">Total Registered</span>
                <span className="text-lg font-bold font-mono text-slate-200">{stats.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-sm text-slate-300">Active Students</span>
                <span className="text-lg font-bold font-mono text-emerald-450">{stats.activeStudents}</span>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Teachers Status</h4>
              <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-sm text-slate-300">Total Registered</span>
                <span className="text-lg font-bold font-mono text-slate-200">{stats.totalTeachers}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <span className="text-sm text-slate-300">Active Teachers</span>
                <span className="text-lg font-bold font-mono text-emerald-450">{stats.activeTeachers}</span>
              </div>
            </div>
          </div>

          {/* Recent Activities feed (Dynamic values) */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Activities</h3>
            <div className="divide-y divide-slate-800/80 border border-slate-850 rounded-xl overflow-hidden bg-slate-950/30">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No recent updates.</div>
              ) : (
                recentActivities.map((act, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-800/10 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full"></span>
                      <span className="text-sm text-slate-300 font-medium">{act}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider">Live info</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT MANAGEMENT PANEL */}
      {activeTab === "students" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No students found matching your criteria.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">IDuniq</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Attendance</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4 font-mono font-bold text-xs text-slate-400">{st.roll}</td>
                      <td className="p-4 text-slate-200 font-bold">{st.user.name}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{st.user.email}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{st.phone}</td>
                      <td className="p-4 text-slate-300 font-bold">{st.class}</td>
                      <td className="p-4 text-slate-350">{st.year}</td>
                      <td className="p-4 font-mono text-emerald-400 font-bold text-xs">{st.attendanceRate}</td>
                      <td className="p-4 text-center">
                        <select
                          value={st.user.status}
                          onChange={(e) => handleToggleStudentStatus(st, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-bold uppercase cursor-pointer border ${
                            st.user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                              : st.user.status === "SUSPENDED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-850 text-slate-400 border-slate-700"
                          }`}
                        >
                          <option value="ACTIVE" className="bg-slate-900 text-slate-200">Active</option>
                          <option value="INACTIVE" className="bg-slate-900 text-slate-200">Inactive</option>
                          <option value="SUSPENDED" className="bg-slate-900 text-slate-200">Suspended</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => triggerEditStudent(st)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 rounded transition duration-150 cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-550/20 text-slate-450 hover:text-rose-400 rounded transition duration-150 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TEACHER MANAGEMENT PANEL */}
      {activeTab === "teachers" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No teachers found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4">Due Salary</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredTeachers.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4 font-mono font-bold text-xs text-slate-400">{tc.teacherId}</td>
                      <td className="p-4 text-slate-200 font-bold">{tc.user.name}</td>
                      <td className="p-4 text-slate-350">{tc.subject}</td>
                      <td className="p-4 font-bold text-amber-450 font-mono text-xs">{tc.rating}/5.0</td>
                      <td className="p-4 font-mono text-slate-300">{tc.salary.toLocaleString()} BDT</td>
                      <td className="p-4 font-mono text-rose-400">{tc.dueSalary.toLocaleString()} BDT</td>
                      <td className="p-4 text-center">
                        <select
                          value={tc.user.status}
                          onChange={(e) => handleToggleTeacherStatus(tc, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-bold uppercase cursor-pointer border ${
                            tc.user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          <option value="ACTIVE" className="bg-slate-900 text-slate-200">Active</option>
                          <option value="SUSPENDED" className="bg-slate-900 text-slate-200">Suspended</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => triggerEditTeacher(tc)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 rounded transition duration-150 cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(tc.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-550/20 text-slate-450 hover:text-rose-400 rounded transition duration-150 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* REGULAR SUPPORT PANEL */}
      {activeTab === "support" && supportStats && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Stats */}
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-450 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <span>Pending: <strong className="text-amber-400 font-mono text-sm">{supportStats.pending}</strong></span>
            <span className="text-slate-700">|</span>
            <span>Completed: <strong className="text-emerald-400 font-mono text-sm">{supportStats.completed}</strong></span>
            <span className="text-slate-700">|</span>
            <span>Today: <strong className="text-blue-400 font-mono text-sm">{supportStats.today}</strong></span>
            <span className="text-slate-700">|</span>
            <span>Target: <strong className="text-slate-250 font-mono text-sm">{supportStats.target}</strong></span>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">No regular support sessions found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Session Code</th>
                      <th className="p-4">Teacher</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Joined Students</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredSessions.map((ss) => (
                      <tr key={ss.id} className="hover:bg-slate-800/10 transition duration-150">
                        <td className="p-4 font-mono font-bold text-xs text-slate-400">S{ss.id.substring(0, 4).toUpperCase()}</td>
                        <td className="p-4 text-slate-200 font-bold">{ss.teacher?.user?.name || "Unassigned"}</td>
                        <td className="p-4 text-slate-350">{ss.subject}</td>
                        <td className="p-4">
                          <div className="text-slate-300 font-medium">{new Date(ss.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-550 font-mono">{ss.time}</div>
                        </td>
                        <td className="p-4 text-slate-400">{ss.duration} mins</td>
                        <td className="p-4 font-mono font-bold text-emerald-400 text-xs">{ss.totalJoinStudent}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ss.status === "SCHEDULED"
                              ? "bg-blue-500/10 text-blue-450 border border-blue-500/20"
                              : ss.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {ss.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {ss.status === "SCHEDULED" && (
                            <button
                              onClick={() => handleCancelSupportSession(ss.id)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-550/20 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
                            >
                              Cancel Session
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-TO-1 SUPPORT PANEL */}
      {activeTab === "one-to-one" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No 1-to-1 support sessions scheduled.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Slot Period</th>
                    <th className="p-4">Meet Link</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredBookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4 font-mono font-bold text-xs text-slate-400">B{bk.id.substring(0, 4).toUpperCase()}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{bk.student?.user?.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{bk.student?.user?.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{bk.slot?.teacher?.user?.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{bk.slot?.teacher?.user?.email}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-350">
                        {bk.slot ? (
                          <>
                            <div>{new Date(bk.slot.slotStart).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(bk.slot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        ) : "-"}
                      </td>
                      <td className="p-4 text-xs font-mono">
                        {bk.meetLink ? (
                          <a href={bk.meetLink} target="_blank" rel="noreferrer" className="text-emerald-450 hover:underline">Link</a>
                        ) : "N/A"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          bk.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                        }`}>
                          {bk.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {bk.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleCancelBooking(bk.id)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-550/20 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-bold transition duration-150 cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* USER MANAGEMENT PANEL */}
      {activeTab === "users" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No user accounts found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-center">Suspended / Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredUsers.map((ur) => (
                    <tr key={ur.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{ur.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{ur.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ur.role === "ADMIN" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-850 text-slate-350"
                        }`}>
                          {ur.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {ur.emailVerified ? (
                          <span className="text-[10px] font-bold text-emerald-450 uppercase">Verified</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-400">
                        {new Date(ur.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ur.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-450" : "bg-rose-500/10 text-rose-455"
                        }`}>
                          {ur.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => triggerEditUser(ur)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 rounded transition duration-150 cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* REVENUE & FINANCE PANEL */}
      {activeTab === "revenue" && finance && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Monthly Rev</span>
              <span className="text-3xl font-black text-slate-100 font-mono mt-2">${finance.monthlyRev.toLocaleString()} BDT</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Refunds</span>
              <span className="text-3xl font-black text-rose-400 font-mono mt-2">${finance.refunds.toLocaleString()} BDT</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Net Profit</span>
              <span className="text-3xl font-black text-emerald-400 font-mono mt-2">${finance.netProfit.toLocaleString()} BDT</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Extra curriculum</span>
              <span className="text-3xl font-black text-blue-400 font-mono mt-2">${finance.extraCurriculum.toLocaleString()} BDT</span>
            </div>
          </div>

          {/* Revenue Growth Chart */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Revenue Growth Chart</h3>
            <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/80 pb-2">
              {growthChart.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded transition duration-100 z-10 font-mono">
                    {item.revenue} BDT
                  </div>
                  <div 
                    style={{ height: `${Math.min(100, Math.max(5, (item.revenue / 100000) * 100))}%` }} 
                    className="w-full bg-gradient-to-t from-emerald-500/50 to-teal-400/80 group-hover:to-emerald-400 group-hover:shadow-lg rounded-t-md transition-all duration-300"
                  ></div>
                  <span className="text-[9px] font-bold text-slate-500 truncate max-w-full mt-2 font-mono">{item.month.substring(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXAMS PANEL */}
      {activeTab === "exams" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {examAttendanceStats.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No exam lists scheduled.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Exam ID</th>
                    <th className="p-4">Exam Name</th>
                    <th className="p-4">Target Class</th>
                    <th className="p-4">Total Students in Class</th>
                    <th className="p-4">Participated / Attended</th>
                    <th className="p-4 text-center">Completion Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {examAttendanceStats.map((ex, idx) => {
                    const ratio = ex.totalStudents > 0 ? Math.round((ex.attended / ex.totalStudents) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/10 transition duration-150">
                        <td className="p-4 font-mono font-bold text-xs text-slate-550">EX{ex.examId.substring(0, 3).toUpperCase()}</td>
                        <td className="p-4 text-slate-200 font-bold">{ex.examName}</td>
                        <td className="p-4 text-slate-300 font-bold">Class {ex.class}</td>
                        <td className="p-4 font-mono text-slate-350">{ex.totalStudents} students</td>
                        <td className="p-4 font-mono text-emerald-400 font-semibold">{ex.attended} attended</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex-1 w-20 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                              <div style={{ width: `${ratio}%` }} className="bg-emerald-450 h-full rounded-full"></div>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-400">{ratio}%</span>
                          </div>
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

      {/* RESULTS DESK PANEL */}
      {activeTab === "results" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="p-8 text-center text-slate-400 text-sm">
            <ShieldAlert className="mx-auto mb-4 text-slate-500" size={32} />
            <p>Exam Results and Marksheets can be logged and verified directly inside the Student profiles and classrooms lists.</p>
          </div>
        </div>
      )}

      {/* SALARY & PAYMENTS LEDGERS TAB */}
      {activeTab === "payments" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex space-x-4 border-b border-slate-800 pb-2">
            <button
              onClick={() => setFinanceSubTab("tuition")}
              className={`pb-2 font-bold text-sm border-b-2 -mb-[10px] transition ${
                financeSubTab === "tuition" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Tuition Fee Ledgers
            </button>
            <button
              onClick={() => setFinanceSubTab("salary")}
              className={`pb-2 font-bold text-sm border-b-2 -mb-[10px] transition ${
                financeSubTab === "salary" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Teacher Salary Ledger
            </button>
          </div>

          {financeSubTab === "tuition" ? (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Student</th>
                    <th className="p-4">Class/Roll</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {tuitionRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-200">{record.student?.user?.name || "Student"}</td>
                      <td className="p-4 text-slate-350">Class {record.student?.class} (Roll {record.student?.roll})</td>
                      <td className="p-4 text-slate-200 font-semibold">{record.month}</td>
                      <td className="p-4 font-mono text-slate-350">{record.amount} BDT</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          record.status === "PAID" ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.paymentMethod ? (
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 border border-slate-700 rounded font-mono">{record.paymentMethod}</span>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Subject/ID</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Disbursed Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {salaryRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-200">{record.teacher?.user?.name || "Teacher"}</td>
                      <td className="p-4 text-slate-350">{record.teacher?.subject} (ID: {record.teacher?.teacherId})</td>
                      <td className="p-4 text-slate-200 font-semibold">{record.month}</td>
                      <td className="p-4 font-mono text-slate-350">{record.amount} BDT</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          record.status === "PAID" ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {record.status === "PAID" ? "Disbursed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SATISFACTION ANALYTICS PANEL */}
      {activeTab === "satisfaction" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 w-fit">
            <span className="text-slate-500 text-[10px] font-bold uppercase">Select Class:</span>
            <select
              value={satisfactionClass}
              onChange={(e) => setSatisfactionClass(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer font-semibold"
            >
              <option value="08">Class 8</option>
              <option value="09">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </div>

          {/* Ratings table */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Subject</th>
                  <th className="p-4">Students Rating</th>
                  <th className="p-4">Guardians Rating</th>
                  <th className="p-4">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {satisfaction.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500 text-xs">No analytics logged for Class {satisfactionClass}.</td>
                  </tr>
                ) : (
                  satisfaction.map((sat) => (
                    <tr key={sat.id} className="hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-200">{sat.subject}</td>
                      <td className="p-4 text-emerald-400 font-mono">{sat.studentRate}/5.0</td>
                      <td className="p-4 text-blue-400 font-mono">{sat.guardianRate}/5.0</td>
                      <td className="p-4 font-bold text-amber-450 font-mono">{sat.avgRate}/5.0</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Satisfaction Trend Chart */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Satisfaction Trend Chart</h3>
            <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/80 pb-2">
              {satisfactionTrend.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 border border-slate-800 text-[10px] text-emerald-450 font-bold px-1.5 py-0.5 rounded transition duration-100 z-10 font-mono">
                    Rating: {item.rating}/5.0
                  </div>
                  <div 
                    style={{ height: `${(item.rating / 5.0) * 100}%` }} 
                    className="w-full bg-gradient-to-t from-emerald-500/40 to-teal-400/85 hover:to-emerald-400 hover:shadow-lg rounded-t-md transition-all duration-300"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 truncate max-w-full mt-2 font-mono">{item.subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsAddStudentOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <GraduationCap className="text-emerald-400" size={20} />
              <span>Add Student Profile</span>
            </h3>
            <p className="text-slate-450 text-[11px] mb-6">Create a student user login and link their academic class.</p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Class</label>
                  <input
                    type="text"
                    placeholder="e.g. 08"
                    value={studentForm.class}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 105"
                    value={studentForm.roll}
                    onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Year</label>
                  <input
                    type="text"
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Department</label>
                  <input
                    type="text"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">School Name</label>
                  <input
                    type="text"
                    value={studentForm.schoolName}
                    onChange={(e) => setStudentForm({ ...studentForm, schoolName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Student..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditStudentOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsEditStudentOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <User className="text-emerald-400" size={20} />
              <span>Edit Student Profile</span>
            </h3>
            <p className="text-slate-450 text-[11px] mb-6">Modify student academic values and login status.</p>

            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editStudentForm.name}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={editStudentForm.email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">User Status</label>
                  <select
                    value={editStudentForm.status}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={editStudentForm.phone}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Class</label>
                  <input
                    type="text"
                    value={editStudentForm.class}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, class: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Roll</label>
                  <input
                    type="text"
                    value={editStudentForm.roll}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, roll: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Year</label>
                  <input
                    type="text"
                    value={editStudentForm.year}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditStudentOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsAddTeacherOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <Plus className="text-emerald-400" size={20} />
              <span>Add Teacher Profile</span>
            </h3>
            <p className="text-slate-450 text-[11px] mb-6">Create a teacher registry, base salary, and credentials.</p>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Teacher ID</label>
                  <input
                    type="text"
                    placeholder="e.g. T005"
                    value={teacherForm.teacherId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Department</label>
                  <input
                    type="text"
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={teacherForm.subject}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Monthly Salary</label>
                  <input
                    type="number"
                    value={teacherForm.salary}
                    onChange={(e) => setTeacherForm({ ...teacherForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Qualification</label>
                <input
                  type="text"
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {isEditTeacherOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsEditTeacherOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <User className="text-emerald-400" size={20} />
              <span>Edit Teacher Profile</span>
            </h3>
            <p className="text-slate-455 text-[11px] mb-6">Update teacher departmental attributes and base salary.</p>

            <form onSubmit={handleEditTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editTeacherForm.name}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={editTeacherForm.email}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={editTeacherForm.subject}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Monthly Salary</label>
                  <input
                    type="number"
                    value={editTeacherForm.salary}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editTeacherForm.status}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer font-bold"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditTeacherOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE SUPPORT SESSION MODAL */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsAddSessionOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <HelpCircle className="text-emerald-400" size={20} />
              <span>Schedule Support Session</span>
            </h3>
            <p className="text-slate-455 text-[11px] mb-6">Create a support session code, teacher educator, and subject target.</p>

            <form onSubmit={handleAddSupportSession} className="space-y-4">
              <div>
                <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Primary Educator</label>
                <select
                  value={sessionForm.teacherId}
                  onChange={(e) => setSessionForm({ ...sessionForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer font-bold"
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user.name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Session Date</label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={sessionForm.subject}
                    onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Joined Students</label>
                  <input
                    type="number"
                    value={sessionForm.totalJoinStudent}
                    onChange={(e) => setSessionForm({ ...sessionForm, totalJoinStudent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER DETAILS MODAL */}
      {isEditUserOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsEditUserOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} />
              <span>Modify User Authorization</span>
            </h3>
            <p className="text-slate-455 text-[11px] mb-6">Manually promote user roles (e.g. to ADMIN) and update login permissions.</p>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Authorized Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer font-bold"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase tracking-wider mb-1">Account Permission</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer font-bold"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended / Frozen</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CASH TUITION MODAL */}
      {isTuitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsTuitionModalOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-400" />
              <span>Record Cash Tuition</span>
            </h3>
            <p className="text-slate-455 text-[11px] mb-6">Manually audit and record cash tuition fee collections.</p>

            <form onSubmit={handleManualTuitionSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Choose Student</label>
                <select
                  value={tuitionForm.studentId}
                  onChange={(e) => setTuitionForm({ ...tuitionForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-250 text-xs cursor-pointer font-bold"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.user.name} (Roll: {s.roll})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Billing Month</label>
                  <select
                    value={tuitionForm.month}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, month: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-250 text-xs cursor-pointer"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    value={tuitionForm.amount}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Status</label>
                <select
                  value={tuitionForm.status}
                  onChange={(e) => setTuitionForm({ ...tuitionForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-250 text-xs cursor-pointer"
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending verification</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTuitionModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD SALARY DISBURSAL MODAL */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-855 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button onClick={() => setIsSalaryModalOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black bg-gradient-to-r from-blue-405 to-indigo-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <Wallet size={20} className="text-blue-450" />
              <span>Disburse Monthly Salary</span>
            </h3>
            <p className="text-slate-455 text-[11px] mb-6">Create payout disbursements records for teachers.</p>

            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div>
                <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Choose Teacher</label>
                <select
                  value={salaryForm.teacherId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-250 text-xs cursor-pointer font-bold"
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user.name} (ID: {t.teacherId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Salary Month</label>
                  <select
                    value={salaryForm.month}
                    onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-250 text-xs cursor-pointer"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    value={salaryForm.amount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-[10px] font-bold uppercase mb-1">Ledger Status</label>
                <select
                  value={salaryForm.status}
                  onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-855 border border-slate-750 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-250 text-xs cursor-pointer"
                >
                  <option value="PAID">Disbursed / Paid</option>
                  <option value="PENDING">Pending Awaiting disbursal</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving payout..." : "Pay Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="text-slate-400 text-sm font-semibold animate-pulse">Initializing Administrative Control Panel...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
