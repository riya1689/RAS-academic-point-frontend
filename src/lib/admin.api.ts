import api from "./api";

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalSupportSessions: number;
  totalClassrooms: number;
  totalRevenue: number;
  dueSalary: number;
  activeStudents: number;
  activeTeachers: number;
}

export interface AttendanceRateData {
  classroom: string;
  code: string;
  rate: number;
}

export interface ResultSuccessData {
  pass: number;
  fail: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminStudent {
  id: string;
  userId: string;
  class: string;
  roll: string;
  department: string;
  schoolName: string;
  phone: string;
  email: string | null;
  year: string;
  role: string;
  attendanceRate: string;
  user: {
    name: string;
    email: string;
    role: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    createdAt: string;
  };
}

export interface AdminTeacher {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  qualification: string;
  subject: string;
  rating: number;
  salary: number;
  dueSalary: number;
  role: string;
  user: {
    name: string;
    email: string;
    role: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    createdAt: string;
  };
}

export interface AdminClassroom {
  id: string;
  classroomCode: string;
  title: string;
  teacherId: string;
  createdAt: string;
  teacher?: {
    user?: {
      name: string;
      email: string;
    };
  };
  _count?: {
    members: number;
  };
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  studentId: string;
  student?: {
    id: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export interface SupportSession {
  id: string;
  teacherId: string;
  date: string;
  time: string;
  meetLink: string;
  subject: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  duration: number;
  totalJoinStudent: number;
  teacher?: {
    user?: {
      name: string;
    };
  };
}

export interface SupportStats {
  pending: number;
  completed: number;
  today: number;
  target: number;
}

export interface OneToOneBooking {
  id: string;
  studentId: string;
  slotId: string;
  meetLink: string;
  description: string;
  status: "CONFIRMED" | "CANCELLED";
  student?: {
    user?: {
      name: string;
      email: string;
    };
  };
  slot?: {
    slotStart: string;
    slotEnd: string;
    teacher?: {
      user?: {
        name: string;
        email: string;
      };
    };
  };
}

export interface SatisfactionRating {
  id: string;
  class: string;
  subject: string;
  studentRate: number;
  guardianRate: number;
  avgRate: number;
}

export interface FinanceDetails {
  monthlyRev: number;
  refunds: number;
  netProfit: number;
  extraCurriculum: number;
}

export interface GrowthChartData {
  month: string;
  revenue: number;
}

export interface ExamAttendanceStat {
  examId: string;
  examName: string;
  class: string;
  totalStudents: number;
  attended: number;
}

// 1. Get Stats and Chart Data
export async function getAdminStats(): Promise<{
  stats: AdminStats;
  charts: {
    attendanceRateChart: AttendanceRateData[];
    resultSuccessChart: ResultSuccessData;
  };
  recentActivities: string[];
}> {
  const response = await api.get("/admin/stats");
  return response.data;
}

// 2. Student APIs
export async function getAdminStudents(): Promise<{ students: AdminStudent[] }> {
  const response = await api.get("/admin/students");
  return response.data;
}

export async function createAdminStudent(data: any): Promise<any> {
  const response = await api.post("/admin/students", data);
  return response.data;
}

export async function updateAdminStudent(id: string, data: any): Promise<any> {
  const response = await api.put(`/admin/students/${id}`, data);
  return response.data;
}

export async function deleteAdminStudent(id: string): Promise<any> {
  const response = await api.delete(`/admin/students/${id}`);
  return response.data;
}

// 3. Teacher APIs
export async function getAdminTeachers(): Promise<{ teachers: AdminTeacher[] }> {
  const response = await api.get("/admin/teachers");
  return response.data;
}

export async function createAdminTeacher(data: any): Promise<any> {
  const response = await api.post("/admin/teachers", data);
  return response.data;
}

export async function updateAdminTeacher(id: string, data: any): Promise<any> {
  const response = await api.put(`/admin/teachers/${id}`, data);
  return response.data;
}

export async function deleteAdminTeacher(id: string): Promise<any> {
  const response = await api.delete(`/admin/teachers/${id}`);
  return response.data;
}

// 4. Support Sessions APIs
export async function getAdminSupportSessions(): Promise<{ sessions: SupportSession[]; stats: SupportStats }> {
  const response = await api.get("/admin/support-sessions");
  return response.data;
}

export async function createAdminSupportSession(data: any): Promise<{ session: SupportSession }> {
  const response = await api.post("/admin/support-sessions", data);
  return response.data;
}

export async function cancelAdminSupportSession(id: string): Promise<any> {
  const response = await api.put(`/admin/support-sessions/${id}/cancel`);
  return response.data;
}

// 5. 1-to-1 Support Bookings APIs
export async function getAdminBookings(): Promise<{ bookings: OneToOneBooking[] }> {
  const response = await api.get("/admin/bookings");
  return response.data;
}

export async function cancelAdminBooking(id: string): Promise<any> {
  const response = await api.put(`/admin/bookings/${id}/cancel`);
  return response.data;
}

// 6. Revenue & Finance details
export async function getFinanceDetails(): Promise<{ finance: FinanceDetails; growthChart: GrowthChartData[] }> {
  const response = await api.get("/admin/revenue/finance");
  return response.data;
}

// 7. Satisfaction Ratings APIs
export async function getSatisfactionRatings(className: string): Promise<{ satisfaction: SatisfactionRating[]; trend: any[] }> {
  const response = await api.get(`/admin/satisfaction?class=${className}`);
  return response.data;
}

// 8. Exam Attendance Statistics
export async function getExamAttendanceStats(): Promise<{ stats: ExamAttendanceStat[] }> {
  const response = await api.get("/admin/exams/attendance-stats");
  return response.data;
}

// 9. Generic Users APIs (Unified Manager)
export async function getAdminUsers(): Promise<{ users: AdminUser[] }> {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function updateAdminUser(id: string, data: any): Promise<any> {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
}

// Re-exports from classrooms for convenience
export async function getAdminClassrooms(): Promise<{ classrooms: AdminClassroom[] }> {
  const response = await api.get("/admin/classrooms");
  return response.data;
}

export async function createAdminClassroom(data: { title: string; teacherId: string }): Promise<{ classroom: AdminClassroom }> {
  const response = await api.post("/admin/classrooms", data);
  return response.data;
}

export async function updateAdminClassroom(id: string, data: { title: string; teacherId: string }): Promise<{ classroom: AdminClassroom }> {
  const response = await api.put(`/admin/classrooms/${id}`, data);
  return response.data;
}

export async function deleteAdminClassroom(id: string): Promise<any> {
  const response = await api.delete(`/admin/classrooms/${id}`);
  return response.data;
}

export async function getClassroomMembers(classroomId: string): Promise<{ members: ClassroomMember[] }> {
  const response = await api.get(`/admin/classrooms/${classroomId}/members`);
  return response.data;
}

export async function enrollStudentInClass(classroomId: string, studentId: string): Promise<{ member: ClassroomMember }> {
  const response = await api.post(`/admin/classrooms/${classroomId}/members`, { studentId });
  return response.data;
}

export async function removeStudentFromClass(classroomId: string, studentId: string): Promise<any> {
  const response = await api.delete(`/admin/classrooms/${classroomId}/members/${studentId}`);
  return response.data;
}
