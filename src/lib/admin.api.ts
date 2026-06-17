import api from "./api";

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalGuardians: number;
  totalRevenue: number;
  totalPending: number;
  totalSalariesPaid: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN";
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
  role: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface AdminTeacher {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  qualification: string;
  role: string;
  user?: {
    name: string;
    email: string;
    role: string;
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

// Stats API
export async function getAdminStats(): Promise<{ stats: AdminStats }> {
  const response = await api.get("/admin/stats");
  return response.data;
}

// User role management API
export async function getAdminUsers(): Promise<{ users: AdminUser[] }> {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function updateUserRole(userId: string, role: string): Promise<any> {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
}

// Students Management APIs
export async function getAdminStudents(): Promise<{ students: AdminStudent[] }> {
  const response = await api.get("/admin/students");
  return response.data;
}

export async function updateAdminStudent(id: string, data: Partial<AdminStudent> & { name?: string; email?: string; role?: string }): Promise<any> {
  const response = await api.put(`/admin/students/${id}`, data);
  return response.data;
}

export async function deleteAdminStudent(id: string): Promise<any> {
  const response = await api.delete(`/admin/students/${id}`);
  return response.data;
}

// Teachers Management APIs
export async function getAdminTeachers(): Promise<{ teachers: AdminTeacher[] }> {
  const response = await api.get("/admin/teachers");
  return response.data;
}

export async function updateAdminTeacher(id: string, data: Partial<AdminTeacher> & { name?: string; email?: string; role?: string }): Promise<any> {
  const response = await api.put(`/admin/teachers/${id}`, data);
  return response.data;
}

export async function deleteAdminTeacher(id: string): Promise<any> {
  const response = await api.delete(`/admin/teachers/${id}`);
  return response.data;
}

// Classrooms Management APIs
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

// Classroom Members Management APIs
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
