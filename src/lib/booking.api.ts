import api from "./api";

// --- TEACHER API ---

export const getGoogleAuthUrl = async () => {
  const { data } = await api.get("/bookings/auth/google");
  return data;
};

export const createSlots = async (slots: { slotStart: string, slotEnd: string }[]) => {
  const { data } = await api.post("/bookings/slots", { slots });
  return data;
};

export const getMyTeacherSlots = async () => {
  const { data } = await api.get("/bookings/slots/my");
  return data;
};

// --- STUDENT API ---

export const getAvailableSlots = async (date?: string, teacherId?: string) => {
  const params: any = {};
  if (date) params.date = date;
  if (teacherId) params.teacherId = teacherId;
  const { data } = await api.get("/bookings/slots", { params });
  return data;
};

export const bookSlot = async (slotId: string, description: string) => {
  const { data } = await api.post("/bookings", { slotId, description });
  return data;
};

export const joinWaitlist = async (slotId: string) => {
  const { data } = await api.post("/bookings/waitlist", { slotId });
  return data;
};

// --- SHARED API ---

export const getMyBookings = async () => {
  const { data } = await api.get("/bookings/my");
  return data;
};

export const cancelBooking = async (bookingId: string) => {
  const { data } = await api.put(`/bookings/${bookingId}/cancel`);
  return data;
};
