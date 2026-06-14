"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Trophy, Medal, Search, Filter, School, Users, 
  ChevronUp, User, Award 
} from "lucide-react";
import { getExams, getLeaderboard, Exam, LeaderboardEntry } from "../../../lib/result.api";

export default function LeaderboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");

  const CLASSES_LIST = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await getExams();
      setExams(data.exams || []);
      if (data.exams?.length > 0) {
        setSelectedExamId(data.exams[0].id);
        fetchRankings(data.exams[0].id, selectedClass, schoolQuery);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load exams list");
      setLoading(false);
    }
  };

  const fetchRankings = async (examId: string, className: string, school: string) => {
    if (!examId) return;
    try {
      setLoading(true);
      const data = await getLeaderboard({
        examId,
        class: className || undefined,
        schoolName: school || undefined
      });
      setLeaderboard(data.leaderboard || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load rankings");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRankings(selectedExamId, selectedClass, schoolQuery);
  };

  // Podium mappings
  const podiumSpots = {
    first: leaderboard.find(e => e.rank === 1),
    second: leaderboard.find(e => e.rank === 2),
    third: leaderboard.find(e => e.rank === 3),
  };

  const remainingRankings = leaderboard.filter(e => e.rank > 3);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="text-amber-400" size={32} />
            <span>Academic Leaderboard</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Audit overall student performance rankings, search by school, or filter by exam sessions.</p>
        </div>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm">
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-1.5">Select Exam *</label>
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              fetchRankings(e.target.value, selectedClass, schoolQuery);
            }}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer font-medium"
            required
          >
            <option value="">-- Choose Exam --</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-1.5">Filter by Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              fetchRankings(selectedExamId, e.target.value, schoolQuery);
            }}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs cursor-pointer font-medium"
          >
            <option value="">All Classes</option>
            {CLASSES_LIST.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-1.5">Search School/College</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="e.g. RAS School"
              value={schoolQuery}
              onChange={(e) => setSchoolQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl text-slate-200 text-xs"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold py-2 rounded-xl transition duration-150 cursor-pointer text-xs"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-slate-900/25 border border-dashed border-slate-800 rounded-2xl py-16 text-center text-slate-500 text-sm">
          <Medal className="mx-auto text-slate-700 mb-3" size={48} />
          No results found for this selection. Try changing the filters.
        </div>
      ) : (
        <div className="space-y-12 animate-fadeIn">
          {/* Top 3 Podium layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6 px-4">
            
            {/* 2nd Place (Silver) */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              {podiumSpots.second ? (
                <div className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center shadow-xl space-y-4 transition duration-200 transform hover:scale-[1.02]">
                  <div className="relative inline-block mx-auto">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-400/40 text-slate-300">
                      <User size={28} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-400 text-slate-950 rounded-full font-bold text-xs flex items-center justify-center border-2 border-slate-950">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-200 truncate">{podiumSpots.second.name}</h4>
                    <p className="text-xs text-slate-400">{podiumSpots.second.schoolName}</p>
                    <p className="text-xs text-slate-500 font-semibold">{podiumSpots.second.class} (Roll: {podiumSpots.second.roll})</p>
                  </div>
                  <div className="bg-slate-900/80 py-2 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold text-sm">
                    {podiumSpots.second.totalScore} Marks
                  </div>
                </div>
              ) : (
                <div className="h-40 w-full border border-dashed border-slate-850 rounded-2xl flex items-center justify-center text-slate-700 text-xs">
                  2nd Place Empty
                </div>
              )}
            </div>

            {/* 1st Place (Gold) */}
            <div className="order-1 md:order-2 flex flex-col items-center relative -top-4">
              {podiumSpots.first ? (
                <div className="w-full bg-slate-900/60 border-2 border-amber-500/30 hover:border-amber-500/50 rounded-3xl p-8 text-center shadow-2xl space-y-5 transition duration-200 transform hover:scale-[1.03] relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                  <div className="relative inline-block mx-auto">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-400 text-amber-400">
                      <Trophy size={36} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 text-slate-950 rounded-full font-extrabold text-sm flex items-center justify-center border-2 border-slate-950">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-100 truncate flex items-center justify-center gap-1">
                      <span>{podiumSpots.first.name}</span>
                      <Award size={18} className="text-amber-400" />
                    </h4>
                    <p className="text-xs text-slate-300 font-medium">{podiumSpots.first.schoolName}</p>
                    <p className="text-xs text-slate-400 font-semibold">{podiumSpots.first.class} (Roll: {podiumSpots.first.roll})</p>
                  </div>
                  <div className="bg-amber-400/10 py-3 rounded-2xl border border-amber-500/25 font-mono text-amber-400 font-extrabold text-base shadow-lg shadow-amber-500/5">
                    {podiumSpots.first.totalScore} Marks
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full border border-dashed border-slate-850 rounded-2xl flex items-center justify-center text-slate-700 text-xs">
                  1st Place Empty
                </div>
              )}
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="order-3 md:order-3 flex flex-col items-center">
              {podiumSpots.third ? (
                <div className="w-full bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center shadow-xl space-y-4 transition duration-200 transform hover:scale-[1.02]">
                  <div className="relative inline-block mx-auto">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-amber-700/40 text-amber-600">
                      <User size={28} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-700 text-slate-950 rounded-full font-bold text-xs flex items-center justify-center border-2 border-slate-950">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-200 truncate">{podiumSpots.third.name}</h4>
                    <p className="text-xs text-slate-400">{podiumSpots.third.schoolName}</p>
                    <p className="text-xs text-slate-500 font-semibold">{podiumSpots.third.class} (Roll: {podiumSpots.third.roll})</p>
                  </div>
                  <div className="bg-slate-900/80 py-2 rounded-xl border border-slate-800 font-mono text-emerald-400 font-bold text-sm">
                    {podiumSpots.third.totalScore} Marks
                  </div>
                </div>
              ) : (
                <div className="h-40 w-full border border-dashed border-slate-850 rounded-2xl flex items-center justify-center text-slate-700 text-xs">
                  3rd Place Empty
                </div>
              )}
            </div>

          </div>

          {/* Remaining Ranks List Table */}
          {remainingRankings.length > 0 && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2 pl-1">
                <Users size={18} className="text-emerald-400" />
                <span>All Academic Rankings</span>
              </h3>

              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 w-20">Rank</th>
                        <th className="p-4">Student</th>
                        <th className="p-4">Class / Roll</th>
                        <th className="p-4">School</th>
                        <th className="p-4 text-right">Aggregated Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {remainingRankings.map((entry) => (
                        <tr key={entry.studentId} className="hover:bg-slate-800/10 transition duration-150">
                          <td className="p-4 font-mono font-bold text-slate-400">
                            #{entry.rank}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
                                <User size={14} />
                              </div>
                              <span className="font-semibold text-slate-200">{entry.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-350">{entry.class}</span>
                            <span className="text-xs text-slate-550 block font-semibold">Roll: {entry.roll}</span>
                          </td>
                          <td className="p-4 text-slate-400 font-medium">
                            <div className="flex items-center gap-1">
                              <School size={12} className="text-slate-500" />
                              <span>{entry.schoolName}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-emerald-400">
                            {entry.totalScore} Marks
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
