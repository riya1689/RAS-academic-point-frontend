"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Plus, CheckCircle2, XCircle, Calendar, Wallet,
  DollarSign, Users, Search, User, Filter, Edit2, Trash2,
  BookOpen, Shield, ShieldAlert, GraduationCap, ArrowUpRight, Award, ChevronRight, X
} from "lucide-react";

// APIs
import {
  getAdminStats, getAdminUsers, updateUserRole,
  getAdminStudents, updateAdminStudent, deleteAdminStudent,
  getAdminTeachers, updateAdminTeacher, deleteAdminTeacher,
  getAdminClassrooms, createAdminClassroom, updateAdminClassroom, deleteAdminClassroom,
  getClassroomMembers, enrollStudentInClass, removeStudentFromClass,
  AdminStats, AdminUser, AdminStudent, AdminTeacher, AdminClassroom, ClassroomMember
} from "../../../lib/admin.api";

import {
  getTuitionAll, getSalaryAll, recordManualTuition, payTeacherSalary,
  TuitionPaymentRecord, SalaryRecord
} from "../../../lib/payment.api";

type TabType = "overview" | "students" | "teachers" | "classrooms" | "finance" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);

  // Stats Data
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Users Data
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Students Data
  const [students, setStudents] = useState<AdminStudent[]>([]);

  // Teachers Data
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);

  // Classrooms Data
  const [classrooms, setClassrooms] = useState<AdminClassroom[]>([]);

  // Finance Data
  const [tuitionRecords, setTuitionRecords] = useState<TuitionPaymentRecord[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [financeSubTab, setFinanceSubTab] = useState<"tuition" | "salary">("tuition");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null);

  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<AdminClassroom | null>(null);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [membersClassroom, setMembersClassroom] = useState<AdminClassroom | null>(null);
  const [classroomMembers, setClassroomMembers] = useState<ClassroomMember[]>([]);
  const [enrollStudentId, setEnrollStudentId] = useState("");

  const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Forms inputs
  const [studentForm, setStudentForm] = useState({
    name: "", email: "", role: "STUDENT", class: "", roll: "", department: "", schoolName: "", phone: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "", email: "", role: "TEACHER", department: "", qualification: "", teacherId: ""
  });

  const [classroomForm, setClassroomForm] = useState({
    title: "", teacherId: ""
  });

  const [tuitionForm, setTuitionForm] = useState({
    studentId: "", month: "January", amount: 1500, status: "PAID" as "PAID" | "PENDING" | "UNPAID"
  });

  const [salaryForm, setSalaryForm] = useState({
    teacherId: "", month: "January", amount: 25000, status: "PAID" as "PAID" | "PENDING"
  });

  const MONTHS_LIST = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Loader
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, studentsRes, teachersRes, classroomsRes, tuitionRes, salaryRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminStudents(),
        getAdminTeachers(),
        getAdminClassrooms(),
        getTuitionAll(),
        getSalaryAll()
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setStudents(studentsRes.students);
      setTeachers(teachersRes.teachers);
      setClassrooms(classroomsRes.classrooms);
      setTuitionRecords(tuitionRes.payments);
      setSalaryRecords(salaryRes.salaries);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load admin panel data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update User Role Manually
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsSubmitting(true);
      await updateUserRole(userId, newRole);
      toast.success("Role updated successfully!");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Student CRUD Submit
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      setIsSubmitting(true);
      await updateAdminStudent(selectedStudent.id, studentForm);
      toast.success("Student profile updated successfully");
      setIsStudentModalOpen(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update student profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student profile? This will also delete their login credentials.")) return;
    try {
      await deleteAdminStudent(studentId);
      toast.success("Student profile deleted");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete student profile");
    }
  };

  // Teacher CRUD Submit
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      setIsSubmitting(true);
      await updateAdminTeacher(selectedTeacher.id, teacherForm);
      toast.success("Teacher profile updated successfully");
      setIsTeacherModalOpen(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update teacher profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to delete this teacher profile? This will also delete their login credentials.")) return;
    try {
      await deleteAdminTeacher(teacherId);
      toast.success("Teacher profile deleted");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete teacher profile");
    }
  };

  // Classroom CRUD Submit
  const handleClassroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (selectedClassroom) {
        await updateAdminClassroom(selectedClassroom.id, classroomForm);
        toast.success("Classroom updated");
      } else {
        await createAdminClassroom(classroomForm);
        toast.success("Classroom created successfully");
      }
      setIsClassroomModalOpen(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClassroom = async (classroomId: string) => {
    if (!confirm("Are you sure you want to delete this classroom?")) return;
    try {
      await deleteAdminClassroom(classroomId);
      toast.success("Classroom deleted successfully");
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete classroom");
    }
  };

  // Classroom Members management
  const handleOpenMembersModal = async (classroom: AdminClassroom) => {
    setMembersClassroom(classroom);
    setIsMembersModalOpen(true);
    try {
      const res = await getClassroomMembers(classroom.id);
      setClassroomMembers(res.members || []);
    } catch (error: any) {
      toast.error("Failed to load classroom members");
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membersClassroom || !enrollStudentId) return;
    try {
      setIsSubmitting(true);
      await enrollStudentInClass(membersClassroom.id, enrollStudentId);
      toast.success("Student enrolled successfully");
      setEnrollStudentId("");
      // Refresh members
      const res = await getClassroomMembers(membersClassroom.id);
      setClassroomMembers(res.members || []);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to enroll student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!membersClassroom) return;
    if (!confirm("Remove student from classroom?")) return;
    try {
      await removeStudentFromClass(membersClassroom.id, studentId);
      toast.success("Student removed");
      const res = await getClassroomMembers(membersClassroom.id);
      setClassroomMembers(res.members || []);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove student");
    }
  };

  // Tuition Manual Record
  const handleManualTuitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuitionForm.studentId) return toast.error("Please select a student");
    try {
      setIsSubmitting(true);
      await recordManualTuition(tuitionForm);
      toast.success("Cash payment recorded successfully!");
      setIsTuitionModalOpen(false);
      setTuitionForm({ studentId: "", month: "January", amount: 1500, status: "PAID" });
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Teacher Salary Payout
  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryForm.teacherId) return toast.error("Please select a teacher");
    try {
      setIsSubmitting(true);
      await payTeacherSalary(salaryForm);
      toast.success("Salary payout record created!");
      setIsSalaryModalOpen(false);
      setSalaryForm({ teacherId: "", month: "January", amount: 25000, status: "PAID" });
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to disburse salary");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modals trigger states populate
  const openEditStudent = (student: AdminStudent) => {
    setSelectedStudent(student);
    setStudentForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      role: student.user?.role || "STUDENT",
      class: student.class || "",
      roll: student.roll || "",
      department: student.department || "",
      schoolName: student.schoolName || "",
      phone: student.phone || ""
    });
    setIsStudentModalOpen(true);
  };

  const openEditTeacher = (teacher: AdminTeacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.user?.name || "",
      email: teacher.user?.email || "",
      role: teacher.user?.role || "TEACHER",
      department: teacher.department || "",
      qualification: teacher.qualification || "",
      teacherId: teacher.teacherId || ""
    });
    setIsTeacherModalOpen(true);
  };

  const openEditClassroom = (classroom: AdminClassroom) => {
    setSelectedClassroom(classroom);
    setClassroomForm({
      title: classroom.title,
      teacherId: classroom.teacherId
    });
    setIsClassroomModalOpen(true);
  };

  const openCreateClassroom = () => {
    setSelectedClassroom(null);
    setClassroomForm({ title: "", teacherId: "" });
    setIsClassroomModalOpen(true);
  };

  // Filter criteria helper
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phone || "").includes(searchQuery);

    const matchesClass = classFilter === "ALL" || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const filteredTeachers = teachers.filter(teacher => {
    return (
      (teacher.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.department || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredClassrooms = classrooms.filter(classroom => {
    return (
      classroom.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.classroomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (classroom.teacher?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || user.role === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTuition = tuitionRecords.filter(record => {
    const studentName = record.student?.user?.name || "";
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.month.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSalary = salaryRecords.filter(record => {
    const teacherName = record.teacher?.user?.name || "";
    const matchesSearch =
      teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.month.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Extract classes list
  const classesList = Array.from(new Set(students.map(s => s.class))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">Gathering administration records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Upper header block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-3xl border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2.5">
            <Shield className="text-emerald-400" size={32} />
            <span>Administrator Control Center</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Monitor and manage student enrollment, teacher logs, tuition schedules, salary dispersals, classroom registries, and user authorization structures.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto z-10">
          <button
            onClick={() => {
              openCreateClassroom();
            }}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            <Plus size={16} />
            <span>Create Classroom</span>
          </button>
          <button
            onClick={() => setIsTuitionModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            <Plus size={16} />
            <span>Record Cash Payment</span>
          </button>
        </div>
      </div>

      {/* Tab bar container */}
      <div className="flex overflow-x-auto space-x-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 scrollbar-none">
        {(["overview", "students", "teachers", "classrooms", "finance", "users"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery("");
              setStatusFilter("ALL");
              setClassFilter("ALL");
            }}
            className={`capitalize flex-1 min-w-[120px] py-3 text-center rounded-xl font-bold text-sm transition duration-150 cursor-pointer ${
              activeTab === tab
                ? "bg-slate-800 text-emerald-400 shadow-md border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "finance" ? "Salary & Payments" : tab === "users" ? "User Roles" : tab}
          </button>
        ))}
      </div>

      {/* Filter panel for non-overview tabs */}
      {activeTab !== "overview" && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/20 p-4 rounded-2xl border border-slate-850">
          <div className="relative w-full sm:flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-sm text-slate-200 placeholder-slate-500 transition duration-150"
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {activeTab === "students" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">Class:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer"
                >
                  <option value="ALL">All Classes</option>
                  {classesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {(activeTab === "users" || activeTab === "finance") && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-slate-200 cursor-pointer"
                >
                  {activeTab === "finance" ? (
                    <>
                      <option value="ALL">All Payments</option>
                      <option value="PAID">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="UNPAID">Unpaid</option>
                    </>
                  ) : (
                    <>
                      <option value="ALL">All Roles</option>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="GUARDIAN">Guardian</option>
                      <option value="ADMIN">Admin</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-950/20 to-slate-900/50 border border-emerald-500/10 hover:border-emerald-500/30 p-6 rounded-2xl shadow-xl flex items-center space-x-4 transition duration-300 transform hover:-translate-y-0.5">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <GraduationCap size={28} />
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-semibold">Total Students</span>
                <span className="text-3xl font-extrabold text-slate-100">{stats.totalStudents}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/20 to-slate-900/50 border border-blue-500/10 hover:border-blue-500/30 p-6 rounded-2xl shadow-xl flex items-center space-x-4 transition duration-300 transform hover:-translate-y-0.5">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                <User size={28} />
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-semibold">Total Teachers</span>
                <span className="text-3xl font-extrabold text-slate-100">{stats.totalTeachers}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-950/20 to-slate-900/50 border border-purple-500/10 hover:border-purple-500/30 p-6 rounded-2xl shadow-xl flex items-center space-x-4 transition duration-300 transform hover:-translate-y-0.5">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400">
                <BookOpen size={28} />
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-semibold">Classrooms Registry</span>
                <span className="text-3xl font-extrabold text-slate-100">{stats.totalClassrooms}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-950/20 to-slate-900/50 border border-teal-500/10 hover:border-teal-500/30 p-6 rounded-2xl shadow-xl flex items-center space-x-4 transition duration-300 transform hover:-translate-y-0.5">
              <div className="p-4 bg-teal-500/10 rounded-2xl text-teal-400">
                <Users size={28} />
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-semibold">Associated Guardians</span>
                <span className="text-3xl font-extrabold text-slate-100">{stats.totalGuardians}</span>
              </div>
            </div>
          </div>

          {/* Revenue and Finance aggregations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-400" />
                <span>Financial Health Overview</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                  <span className="text-slate-400 text-xs font-semibold block mb-1">Tuition Fees Revenue</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{stats.totalRevenue} BDT</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                  <span className="text-slate-400 text-xs font-semibold block mb-1">Pending Ledger Collections</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{stats.totalPending} BDT</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                  <span className="text-slate-400 text-xs font-semibold block mb-1">Teacher Salaries Disbursed</span>
                  <span className="text-xl font-bold font-mono text-blue-400">{stats.totalSalariesPaid} BDT</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ArrowUpRight size={20} className="text-teal-400" />
                <span>Quick Access Desk</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveTab("students");
                  }}
                  className="p-3 text-left rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition duration-150 cursor-pointer"
                >
                  <span className="text-slate-300 font-bold block text-sm">Students List</span>
                  <span className="text-slate-500 text-xs font-semibold">View, Edit, Delete</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("teachers");
                  }}
                  className="p-3 text-left rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition duration-150 cursor-pointer"
                >
                  <span className="text-slate-300 font-bold block text-sm">Teachers Registry</span>
                  <span className="text-slate-500 text-xs font-semibold">Audit credentials</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("classrooms");
                  }}
                  className="p-3 text-left rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition duration-150 cursor-pointer"
                >
                  <span className="text-slate-300 font-bold block text-sm">Classrooms</span>
                  <span className="text-slate-500 text-xs font-semibold">Add / Remove students</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("users");
                  }}
                  className="p-3 text-left rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition duration-150 cursor-pointer"
                >
                  <span className="text-slate-300 font-bold block text-sm">User Roles</span>
                  <span className="text-slate-500 text-xs font-semibold">Promote to Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS MANAGEMENT TAB */}
      {activeTab === "students" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No student records found matching the query.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Student</th>
                    <th className="p-4">Class Details</th>
                    <th className="p-4">Academy / School</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4 text-center">User Role</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{student.user?.name || "Student"}</div>
                            <div className="text-xs text-slate-400 font-mono">{student.user?.email || student.email || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300 font-bold">Class: {student.class}</div>
                        <div className="text-xs text-slate-500 font-semibold">Roll: {student.roll} | Dept: {student.department || "N/A"}</div>
                      </td>
                      <td className="p-4 text-slate-300">{student.schoolName}</td>
                      <td className="p-4 font-mono text-slate-300 text-xs">{student.phone}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold tracking-wide uppercase ${
                          student.user?.role === "ADMIN" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-300"
                        }`}>
                          {student.user?.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditStudent(student)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition duration-150 cursor-pointer"
                            title="Edit Student Profile"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition duration-150 cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
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

      {/* TEACHERS MANAGEMENT TAB */}
      {activeTab === "teachers" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No teacher profiles found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Teacher ID</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Qualifications</th>
                    <th className="p-4 text-center">User Role</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{teacher.user?.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{teacher.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-mono font-bold text-xs">{teacher.teacherId}</td>
                      <td className="p-4 text-slate-300">{teacher.department}</td>
                      <td className="p-4 text-slate-400">{teacher.qualification}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold tracking-wide uppercase ${
                          teacher.user?.role === "ADMIN" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-300"
                        }`}>
                          {teacher.user?.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditTeacher(teacher)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition duration-150 cursor-pointer"
                            title="Edit Teacher"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition duration-150 cursor-pointer"
                            title="Delete Teacher"
                          >
                            <Trash2 size={14} />
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

      {/* CLASSROOMS REGISTRY TAB */}
      {activeTab === "classrooms" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredClassrooms.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No classroom records found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Classroom Code</th>
                    <th className="p-4">Class Title</th>
                    <th className="p-4">Assigned Teacher</th>
                    <th className="p-4">Enrolled Students</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredClassrooms.map((classroom) => (
                    <tr key={classroom.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4">
                        <span className="font-mono bg-slate-850 px-3 py-1 text-xs font-bold text-slate-200 border border-slate-800 rounded">
                          {classroom.classroomCode}
                        </span>
                      </td>
                      <td className="p-4 text-slate-200 font-bold">{classroom.title}</td>
                      <td className="p-4">
                        <div className="text-slate-300 font-semibold">{classroom.teacher?.user?.name || "Unassigned"}</div>
                        <div className="text-xs text-slate-500 font-mono">{classroom.teacher?.user?.email || ""}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1.5 font-bold text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10">
                          <span>{classroom._count?.members || 0}</span>
                          <span>students</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenMembersModal(classroom)}
                            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition duration-150 cursor-pointer"
                          >
                            <Users size={12} />
                            <span>Members</span>
                          </button>
                          <button
                            onClick={() => openEditClassroom(classroom)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition duration-150 cursor-pointer"
                            title="Edit Title / Teacher"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClassroom(classroom.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition duration-150 cursor-pointer"
                            title="Delete Classroom"
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

      {/* FINANCE & PAYMENTS TAB */}
      {activeTab === "finance" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tab selection */}
          <div className="flex space-x-4 border-b border-slate-800 pb-2">
            <button
              onClick={() => {
                setFinanceSubTab("tuition");
                setStatusFilter("ALL");
              }}
              className={`pb-2 font-bold text-sm border-b-2 -mb-[10px] transition duration-150 ${
                financeSubTab === "tuition" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Tuition Fee Ledgers
            </button>
            <button
              onClick={() => {
                setFinanceSubTab("salary");
                setStatusFilter("ALL");
              }}
              className={`pb-2 font-bold text-sm border-b-2 -mb-[10px] transition duration-150 ${
                financeSubTab === "salary" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Teacher Salary Ledger
            </button>
          </div>

          {financeSubTab === "tuition" ? (
            /* Student Tuition Records Table */
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                {filteredTuition.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-sm">No tuition records found.</div>
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
                              <div className="font-bold text-slate-200">{record.student?.user?.name || "Student"}</div>
                              <div className="text-xs text-slate-400 font-mono">{record.student?.user?.email || "-"}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-300">Class: {record.student?.class || "-"}</div>
                              <div className="text-xs text-slate-500 font-semibold">Roll: {record.student?.roll || "-"}</div>
                            </td>
                            <td className="p-4 text-slate-300 font-bold">{record.month}</td>
                            <td className="p-4 font-mono text-slate-350">{record.amount} BDT</td>
                            <td className="p-4">
                              {isPaid && (
                                <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                  <CheckCircle2 size={12} />
                                  <span>Paid</span>
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center space-x-1.5 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                  <Calendar size={12} />
                                  <span>Pending</span>
                                </span>
                              )}
                              {isUnpaid && (
                                <span className="inline-flex items-center space-x-1.5 text-rose-400 font-bold text-xs bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                                  <XCircle size={12} />
                                  <span>Unpaid</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {record.paymentMethod ? (
                                <span className="text-[10px] tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                                  {record.paymentMethod}
                                </span>
                              ) : (
                                <span className="text-slate-650 italic text-xs">-</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400 font-mono text-xs">
                              {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                              }) : "-"}
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
            /* Salary ledger table */
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                {filteredSalary.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-sm">No teacher salary payouts recorded.</div>
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

                        return (
                          <tr key={record.id} className="hover:bg-slate-800/10 transition duration-150">
                            <td className="p-4">
                              <div className="font-bold text-slate-200">{record.teacher?.user?.name || "Teacher"}</div>
                              <div className="text-xs text-slate-400 font-mono">{record.teacher?.user?.email || "-"}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-300">{record.teacher?.department || "-"}</div>
                              <div className="text-xs text-slate-500 font-semibold font-mono">ID: {record.teacher?.teacherId || "-"}</div>
                            </td>
                            <td className="p-4 text-slate-300 font-bold">{record.month}</td>
                            <td className="p-4 font-mono text-slate-300">{record.amount} BDT</td>
                            <td className="p-4">
                              {isPaid ? (
                                <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                  <CheckCircle2 size={12} />
                                  <span>Paid / Disbursed</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                  <Calendar size={12} />
                                  <span>Awaiting Disbursal</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400 font-mono text-xs">
                              {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric"
                              }) : "-"}
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
        </div>
      )}

      {/* GENERAL USERS LIST & PROMOTION TAB */}
      {activeTab === "users" && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No users found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4 text-right">Promote/Update Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-800/10 transition duration-150">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                            {usr.role === "ADMIN" ? <Shield className="text-rose-400" size={18} /> : <User size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{usr.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{usr.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {usr.emailVerified ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">Verified</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">
                        {new Date(usr.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          usr.role === "ADMIN" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-300"
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 focus:outline-none rounded-lg text-xs text-slate-200 cursor-pointer transition duration-150"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="TEACHER">Teacher</option>
                          <option value="GUARDIAN">Guardian</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* STUDENT DETAILS EDIT MODAL */}
      {isStudentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsStudentModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1.5 flex items-center gap-2">
              <User size={22} className="text-emerald-400" />
              <span>Edit Student Profile</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Modify classroom attributes and user logins for this student.</p>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-350 text-xs font-bold mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">User Role</label>
                  <select
                    value={studentForm.role}
                    onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Class</label>
                  <input
                    type="text"
                    value={studentForm.class}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Roll Number</label>
                  <input
                    type="text"
                    value={studentForm.roll}
                    onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Department</label>
                  <input
                    type="text"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">School Name</label>
                  <input
                    type="text"
                    value={studentForm.schoolName}
                    onChange={(e) => setStudentForm({ ...studentForm, schoolName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition duration-200 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER DETAILS EDIT MODAL */}
      {isTeacherModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsTeacherModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1.5 flex items-center gap-2">
              <User size={22} className="text-blue-400" />
              <span>Edit Teacher Profile</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Modify credentials and department tags for this teacher.</p>

            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">User Role</label>
                  <select
                    value={teacherForm.role}
                    onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Teacher ID</label>
                  <input
                    type="text"
                    value={teacherForm.teacherId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Department</label>
                  <input
                    type="text"
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Qualification</label>
                <input
                  type="text"
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition duration-200 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASSROOM CREATE/EDIT MODAL */}
      {isClassroomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsClassroomModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1.5 flex items-center gap-2">
              <BookOpen size={22} className="text-emerald-400" />
              <span>{selectedClassroom ? "Edit Classroom" : "Create Classroom"}</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Create a new classroom registry and link a teacher as main educator.</p>

            <form onSubmit={handleClassroomSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Class Title</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Core 101"
                  value={classroomForm.title}
                  onChange={(e) => setClassroomForm({ ...classroomForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Select Primary Teacher</label>
                <select
                  value={classroomForm.teacherId}
                  onChange={(e) => setClassroomForm({ ...classroomForm, teacherId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user?.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsClassroomModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition duration-200 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : selectedClassroom ? "Update Classroom" : "Create Classroom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASSROOM MEMBERS MANAGEMENT MODAL */}
      {isMembersModalOpen && membersClassroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsMembersModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 flex items-center gap-2">
              <Users size={22} className="text-emerald-400" />
              <span>Classroom Enrollments</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4">Classroom: <strong className="text-slate-250 font-bold">{membersClassroom.title}</strong> ({membersClassroom.classroomCode})</p>

            {/* Enroll student form */}
            <form onSubmit={handleEnrollStudent} className="flex gap-2 mb-6">
              <select
                value={enrollStudentId}
                onChange={(e) => setEnrollStudentId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                required
              >
                <option value="">-- Enroll a student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.user?.name} (Class: {s.class}, Roll: {s.roll})</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-sm"
                disabled={isSubmitting}
              >
                Enroll
              </button>
            </form>

            {/* Members List */}
            <h4 className="text-sm font-bold text-slate-300 mb-3">Enrolled Students ({classroomMembers.length})</h4>
            <div className="max-h-60 overflow-y-auto border border-slate-850 rounded-xl divide-y divide-slate-800/80 bg-slate-950/30">
              {classroomMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">No students enrolled yet.</div>
              ) : (
                classroomMembers.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-3.5 hover:bg-slate-800/10">
                    <div>
                      <div className="font-bold text-slate-200 text-sm">{member.student?.user?.name || "Student"}</div>
                      <div className="text-xs text-slate-500 font-mono">{member.student?.user?.email || ""}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(member.studentId)}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded transition duration-150 cursor-pointer"
                      title="De-enroll student"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex pt-6">
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition duration-150 cursor-pointer text-sm"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD CASH TUITION MODAL */}
      {isTuitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsTuitionModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1.5 flex items-center gap-2">
              <DollarSign size={22} className="text-emerald-400" />
              <span>Record Cash Tuition</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Create or update a cash tuition payment adjustment for a student.</p>

            <form onSubmit={handleManualTuitionSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Choose Student</label>
                <select
                  value={tuitionForm.studentId}
                  onChange={(e) => setTuitionForm({ ...tuitionForm, studentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.user?.name} (Class: {s.class}, Roll: {s.roll})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Billing Month</label>
                  <select
                    value={tuitionForm.month}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, month: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Amount (BDT)</label>
                  <input
                    type="number"
                    value={tuitionForm.amount}
                    onChange={(e) => setTuitionForm({ ...tuitionForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Payment Ledger Status</label>
                <select
                  value={tuitionForm.status}
                  onChange={(e) => setTuitionForm({ ...tuitionForm, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending approval</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTuitionModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition duration-200 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD SALARY DISBURSAL MODAL */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-scaleIn">
            <button
              onClick={() => setIsSalaryModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1.5 flex items-center gap-2">
              <Wallet size={22} className="text-blue-450" />
              <span>Pay Teacher Salary</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Disburse monthly salary and log transaction in payouts ledger.</p>

            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Choose Teacher</label>
                <select
                  value={salaryForm.teacherId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, teacherId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user?.name} (ID: {t.teacherId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Salary Month</label>
                  <select
                    value={salaryForm.month}
                    onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-bold mb-1.5">Payout Amount (BDT)</label>
                  <input
                    type="number"
                    value={salaryForm.amount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-355 text-xs font-bold mb-1.5">Disbursal Ledger Status</label>
                <select
                  value={salaryForm.status}
                  onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-sm cursor-pointer"
                >
                  <option value="PAID">Disbursed / Paid</option>
                  <option value="PENDING">Awaiting disbursal</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white font-bold rounded-xl shadow-lg transition duration-205 cursor-pointer"
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
