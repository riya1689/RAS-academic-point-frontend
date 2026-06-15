"use client";

import { useState, useEffect } from "react";
import { getGoogleAuthUrl, createSlots, getMyTeacherSlots, cancelBooking, getMyBookings } from "@/lib/booking.api";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Link as LinkIcon, CheckCircle2, User, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function TeacherBookingPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("calendar_linked")) {
      toast.success("Google Calendar Linked Successfully!");
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { slots } = await getMyTeacherSlots();
      setSlots(slots);
    } catch (error) {
      toast.error("Failed to load your slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCalendar = async () => {
    try {
      const { url } = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to get Google Auth URL.");
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) return toast.error("Please fill all fields");

    // Convert to UTC ISO Strings
    const slotStart = new Date(`${date}T${startTime}:00`).toISOString();
    const slotEnd = new Date(`${date}T${endTime}:00`).toISOString();

    if (new Date(slotStart) >= new Date(slotEnd)) {
      return toast.error("End time must be after start time");
    }

    try {
      await createSlots([{ slotStart, slotEnd }]);
      toast.success("Slot added successfully!");
      fetchData();
      setStartTime("");
      setEndTime("");
    } catch (error) {
      toast.error("Failed to add slot");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? If there is a waitlist, the next student will be automatically booked.")) return;
    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled.");
      fetchData();
    } catch (error) {
      toast.error("Failed to cancel booking.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            1-to-1 Sessions
          </h1>
          <p className="text-slate-400 mt-2">Manage your availability and upcoming private sessions.</p>
        </div>
        <button
          onClick={handleLinkCalendar}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-500/20"
        >
          <LinkIcon size={20} />
          <span>Link Google Calendar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Slots Form */}
        <div className="lg:col-span-1 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Plus className="text-emerald-400" />
            <span>Add Availability</span>
          </h2>
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition duration-200 mt-4 shadow-lg shadow-emerald-500/20"
            >
              Add Slot
            </button>
          </form>
        </div>

        {/* Slots List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold px-2">Your Schedule</h2>
          {slots.length === 0 ? (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>You haven't created any slots yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {slots.map((slot) => {
                const sStart = new Date(slot.slotStart);
                const sEnd = new Date(slot.slotEnd);
                const isPast = sEnd < new Date();

                return (
                  <div key={slot.id} className={`bg-slate-900/60 rounded-2xl border ${slot.isBooked ? 'border-emerald-500/30' : 'border-slate-800'} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isPast ? 'opacity-50' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${slot.isBooked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                        {slot.isBooked ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-slate-200">
                          {sStart.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-emerald-400/90 font-mono text-sm">
                          {sStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {sEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {slot._count.waitlist > 0 && (
                          <div className="flex items-center space-x-1 text-amber-400 text-xs mt-2 bg-amber-400/10 w-fit px-2 py-1 rounded-md">
                            <Users size={12} />
                            <span>Waitlist: {slot._count.waitlist}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3">
                      {slot.isBooked && slot.booking ? (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3 text-sm min-w-[200px]">
                           <div className="bg-slate-800 p-1.5 rounded-full">
                             <User size={16} className="text-slate-300"/>
                           </div>
                           <div>
                             <p className="font-medium text-slate-200">{slot.booking.student.user.name}</p>
                             <p className="text-slate-500 text-xs">Class: {slot.booking.student.class}</p>
                           </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm italic py-2">Available</span>
                      )}

                      {slot.isBooked && slot.booking?.status !== "CANCELLED" && (
                         <div className="flex gap-2">
                           {slot.booking.meetLink && (
                             <a href={slot.booking.meetLink} target="_blank" rel="noreferrer" className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition">
                               Join Meet
                             </a>
                           )}
                           <button onClick={() => handleCancelBooking(slot.booking.id)} className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition flex items-center space-x-1">
                              <Trash2 size={12} />
                              <span>Cancel</span>
                           </button>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
