import api from "./api";

export interface Exam {
  id: string;
  name: string;
  examDate: string;
}

export interface ResultRecord {
  id: string;
  studentId: string;
  examId: string;
  subject: string;
  writtenMark: number;
  mcqMark: number;
  practicalMark: number | null;
  totalMark: number;
  writtenPassMark: number;
  mcqPassMark: number;
  practicalPassMark: number | null;
  result: "PASS" | "FAIL";
  exam?: Exam;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  class: string;
  roll: string;
  schoolName: string;
  totalScore: number;
}

export async function getExams(): Promise<{ exams: Exam[] }> {
  const response = await api.get("/exams");
  return response.data;
}

export async function createExam(data: { name: string; examDate: string }): Promise<{ exam: Exam }> {
  const response = await api.post("/exams", data);
  return response.data;
}

export async function uploadResult(data: {
  studentId: string;
  examId: string;
  subject: string;
  writtenMark: number;
  mcqMark: number;
  practicalMark?: number | null;
  writtenPassMark?: number;
  mcqPassMark?: number;
  practicalPassMark?: number | null;
}): Promise<any> {
  const response = await api.post("/results", data);
  return response.data;
}

export async function getMyResults(examId?: string): Promise<{ results: ResultRecord[] }> {
  const url = examId ? `/results/my?examId=${examId}` : "/results/my";
  const response = await api.get(url);
  return response.data;
}

export async function getStudentResults(studentId: string, examId?: string): Promise<{ results: ResultRecord[] }> {
  const url = examId ? `/results/student/${studentId}?examId=${examId}` : `/results/student/${studentId}`;
  const response = await api.get(url);
  return response.data;
}

export async function getLeaderboard(params: {
  examId: string;
  class?: string;
  schoolName?: string;
}): Promise<{ leaderboard: LeaderboardEntry[] }> {
  let url = `/leaderboard?examId=${params.examId}`;
  if (params.class) url += `&class=${encodeURIComponent(params.class)}`;
  if (params.schoolName) url += `&schoolName=${encodeURIComponent(params.schoolName)}`;

  const response = await api.get(url);
  return response.data;
}

export async function updateExam(id: string, data: { name: string; examDate: string }): Promise<{ exam: Exam }> {
  const response = await api.put(`/exams/${id}`, data);
  return response.data;
}

export async function updateResult(
  id: string,
  data: {
    writtenMark: number;
    mcqMark: number;
    practicalMark?: number | null;
    writtenPassMark?: number;
    mcqPassMark?: number;
    practicalPassMark?: number | null;
  }
): Promise<any> {
  const response = await api.put(`/results/${id}`, data);
  return response.data;
}

export async function deleteResult(id: string): Promise<any> {
  const response = await api.delete(`/results/${id}`);
  return response.data;
}
