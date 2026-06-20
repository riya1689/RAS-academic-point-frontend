import api from "./api";

export interface TuitionLog {
  month: string;
  status: "PAID" | "UNPAID" | "PENDING";
  amount: number;
  paymentMethod: "ONLINE" | "CASH" | null;
  paymentDate: string | null;
}

export interface SalaryLog {
  month: string;
  status: "PAID" | "UNPAID" | "PENDING";
  amount: number;
  paymentDate: string | null;
}

export interface Student {
  id: string;
  userId: string;
  class: string;
  roll: string;
  department: string;
  schoolName: string;
  phone: string;
  email: string | null;
  user: {
    name: string;
    email: string;
  };
}

export interface Teacher {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  qualification: string;
  subject: string;
  user: {
    name: string;
    email: string;
  };
}

export interface TuitionPaymentRecord {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  status: "PAID" | "UNPAID" | "PENDING";
  paymentMethod: "ONLINE" | "CASH" | null;
  paymentDate: string | null;
  createdAt: string;
  student: Student;
}

export interface SalaryRecord {
  id: string;
  teacherId: string;
  month: string;
  amount: number;
  status: "PAID" | "UNPAID" | "PENDING";
  paymentDate: string | null;
  createdAt: string;
  teacher: Teacher;
}

// Student APIs
export async function getTuitionLogs(): Promise<{ tuitionLogs: TuitionLog[] }> {
  const response = await api.get("/payments/tuition/my");
  return response.data;
}

export async function createCheckoutSession(month: string, amount: number): Promise<{ sessionId: string; checkoutUrl: string }> {
  const response = await api.post("/payments/tuition/checkout", { month, amount });
  return response.data;
}

export async function createEnrollmentCheckoutSession(classId: string, amount: number): Promise<{ sessionId: string; checkoutUrl: string }> {
  const response = await api.post("/payments/enroll/checkout", { classId, amount });
  return response.data;
}

export async function getMyEnrollments(): Promise<{ enrollments: any[] }> {
  const response = await api.get("/payments/enrollments/my");
  return response.data;
}

export async function verifyEnrollmentSession(sessionId: string): Promise<{ status: string }> {
  const response = await api.get(`/payments/enrollments/verify-session?session_id=${sessionId}`);
  return response.data;
}

// Teacher APIs
export async function getSalaryLogs(): Promise<{ salaryLogs: SalaryLog[] }> {
  const response = await api.get("/payments/salary/my");
  return response.data;
}

// Admin APIs
export async function getStudents(): Promise<{ students: Student[] }> {
  const response = await api.get("/payments/students");
  return response.data;
}

export async function getTeachers(): Promise<{ teachers: Teacher[] }> {
  const response = await api.get("/payments/teachers");
  return response.data;
}

export async function getTuitionAll(): Promise<{ payments: TuitionPaymentRecord[] }> {
  const response = await api.get("/payments/tuition/all");
  return response.data;
}

export async function getSalaryAll(): Promise<{ salaries: SalaryRecord[] }> {
  const response = await api.get("/payments/salary/all");
  return response.data;
}

export async function recordManualTuition(data: {
  studentId: string;
  month: string;
  amount: number;
  status: "PAID" | "PENDING" | "UNPAID";
}): Promise<any> {
  const response = await api.post("/payments/tuition/manual", data);
  return response.data;
}

export async function payTeacherSalary(data: {
  teacherId: string;
  month: string;
  amount: number;
  status: "PAID" | "PENDING";
}): Promise<any> {
  const response = await api.post("/payments/salary/pay", data);
  return response.data;
}
