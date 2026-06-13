import api from "./api";

export const createSupportSession = async (date: string, time: string, meetLink?: string) => {
  const response = await api.post("/support-sessions", { date, time, meetLink });
  return response.data;
};

export const getActiveSupportSessions = async () => {
  const response = await api.get("/support-sessions/active");
  return response.data;
};

export const submitSupportTicket = async (sessionId: string, problemDesc: string) => {
  const response = await api.post(`/support-sessions/${sessionId}/ticket`, { problemDesc });
  return response.data;
};

export const getSupportQueue = async (sessionId: string) => {
  const response = await api.get(`/support-sessions/${sessionId}/queue`);
  return response.data;
};

export const updateTicketStatus = async (sessionId: string, studentId: string, status: "ACTIVE" | "RESOLVED") => {
  const response = await api.patch(`/support-sessions/${sessionId}/tickets/${studentId}`, { status });
  return response.data;
};
