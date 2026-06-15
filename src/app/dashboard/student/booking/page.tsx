"use client";

import { useState, useEffect } from "react";
import { getAvailableSlots, bookSlot, joinWaitlist, getMyBookings, cancelBooking } from "@/lib/booking.api";
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, Users, Trash2, Video } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentBookingPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myWaitlists, setMyWaitlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Group slots by teacher
  const [groupedSlots, setGroupedSlots] = useState<any>({});

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchMyData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchMyData = async () => {
    try {
      const data = await getMyBookings();
      setMyBookings(data.bookings);
      setMyWaitlists(data.waitlists);
    } catch (error) {
      toast.error("Failed to load your upcoming sessions.");
    }
  };

  const fetchSlotsForDate = async (date: string) => {
    setLoading(true);
    try {
      const data = await getAvailableSlots(date);
      // Group by teacher
      const grouped = data.slots.reduce((acc: any, slot: any) => {
        const tId = slot.teacher.id;
        if (!acc[tId]) {
          acc[tId] = {
            teacherName: slot.teacher.user.name,
            department: slot.teacher.department,
            slots: []
          };
        }
        acc[tId].slots.push(slot);
        return acc;
      }, {});
      setGroupedSlots(grouped);
      setSlots(data.slots);
    } catch (error) {
      toast.error("Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    const desc = prompt("Any specific topic you want to discuss? (Optional)");
    if (desc === null) return; // User cancelled prompt

    try {
      await bookSlot(slotId, desc);
      toast.success("Successfully booked session!");
      fetchSlotsForDate(selectedDate);
      fetchMyData();
    } catch (error: any) {
      if (error.response?.data?.message?.includes("grabbed")) {
        toast.error(error.response.data.message, { duration: 5000 });
      } else {
        toast.error("Failed to book slot.");
      }
      fetchSlotsForDate(selectedDate);
    }
  };

  const handleJoinWaitlist = async (slotId: string) => {
    if (!confirm("This slot is currently booked. Do you want to join the waitlist? You will be automatically booked if they cancel.")) return;
    
    try {
      await joinWaitlist(slotId);
      toast.success("Joined waitlist successfully!");
      fetchMyData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join waitlist");
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled.");
      fetchSlotsForDate(selectedDate);
      fetchMyData();
    } catch (error) {
      toast.error("Failed to cancel booking.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Book a 1-to-1 Session
        </h1>
        <p className="text-slate-400 mt-2">Get personalized help from your teachers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Availability Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <CalendarIcon className="text-emerald-400" />
                <span>Available Teachers</span>
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
              </div>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>No teachers have available slots on this date.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(groupedSlots).map((group: any, idx) => (
                  <div key={idx} className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-slate-200">{group.teacherName}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{group.department} Dept.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {group.slots.map((slot: any) => {
                        const sStart = new Date(slot.slotStart);
                        const sEnd = new Date(slot.slotEnd);
                        const isPast = sEnd < new Date();
                        if (isPast) return null;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => slot.isBooked ? handleJoinWaitlist(slot.id) : handleBookSlot(slot.id)}
                            className={`flex flex-col items-center p-3 rounded-xl border transition duration-200 ${
                              slot.isBooked 
                                ? "bg-slate-900 border-slate-800 opacity-80 hover:bg-slate-800 cursor-pointer"
                                : "bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500 cursor-pointer"
                            }`}
                          >
                            <span className={`text-sm font-mono ${slot.isBooked ? "text-slate-400" : "text-emerald-400"}`}>
                              {sStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {slot.isBooked ? (
                              <span className="text-[10px] uppercase font-semibold text-slate-500 mt-1 flex items-center">
                                Booked
                                {slot._count.waitlist > 0 && <span className="ml-1 text-amber-500 flex items-center"><Users size={10} className="mr-0.5"/>{slot._count.waitlist}</span>}
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-semibold text-emerald-500 mt-1">Book</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Upcoming Sessions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Clock className="text-blue-400" />
              <span>My Sessions</span>
            </h2>
            
            <div className="space-y-4">
              {myBookings.length === 0 && myWaitlists.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">You have no upcoming sessions.</p>
              ) : (
                <>
                  {myBookings.filter(b => b.status === "CONFIRMED").map(booking => {
                    const dt = new Date(booking.slot.slotStart);
                    return (
                      <div key={booking.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex justify-between items-start mb-2">
                           <p className="font-semibold text-slate-200">{dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                           <p className="text-emerald-400 text-sm font-mono">{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">with <span className="text-slate-300 font-medium">{booking.slot.teacher.user.name}</span></p>
                        
                        <div className="flex gap-2">
                          {booking.meetLink && (
                            <a href={booking.meetLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg transition">
                              <Video size={14} />
                              <span>Join</span>
                            </a>
                          )}
                          <button onClick={() => handleCancel(booking.id)} className="flex items-center justify-center space-x-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-2 rounded-lg transition text-xs">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {myWaitlists.map(wait => {
                     const dt = new Date(wait.slot.slotStart);
                     return (
                       <div key={wait.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 border-dashed relative">
                          <div className="flex justify-between items-start mb-2">
                             <p className="font-semibold text-slate-300">{dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                             <p className="text-amber-400 text-sm font-mono">{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <p className="text-sm text-slate-400">Waitlisted for <span className="text-slate-300 font-medium">{wait.slot.teacher.user.name}</span></p>
                       </div>
                     )
                  })}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
