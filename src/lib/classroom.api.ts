import api from "./api";

export const createClassroom = async (title: string) => {
  const response = await api.post("/classrooms", { title });
  return response.data;
};

export const getTeacherClassrooms = async () => {
  const response = await api.get("/classrooms/teacher");
  return response.data;
};

export const joinClassroom = async (code: string) => {
  const response = await api.post("/classrooms/join", { code });
  return response.data;
};

export const getStudentClassrooms = async () => {
  const response = await api.get("/classrooms/student");
  return response.data;
};

export const getClassroomDetails = async (classroomId: string) => {
  const response = await api.get(`/classrooms/${classroomId}`);
  return response.data;
};

export const submitAttendance = async (
  classroomId: string,
  date: string,
  records: { studentId: string; status: "PRESENT" | "ABSENT" }[]
) => {
  const response = await api.post(`/classrooms/${classroomId}/attendance`, { date, records });
  return response.data;
};

export const getStudentAttendance = async (classroomId: string) => {
  const response = await api.get(`/classrooms/${classroomId}/attendance/my`);
  return response.data;
};

export const getGuardianStudentClassrooms = async () => {
  const response = await api.get("/classrooms/guardian/list");
  return response.data;
};

export const getGuardianStudentAttendance = async (classroomId: string) => {
  const response = await api.get(`/classrooms/${classroomId}/attendance/guardian`);
  return response.data;
};