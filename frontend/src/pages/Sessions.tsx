import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";
import EventTimeline from "../components/EventTimeline";
import { Clock, Zap, Calendar, RefreshCcw, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const API_BASE = "http://localhost:5000/api";

interface Session {
  _id: string;
  total_events: number;
  page_views: number;
  clicks: number;
  unique_page_count: number;
  first_event: string;
  last_event: string;
  device_type?: string;
}

interface EventData {
  _id: string;
  session_id: string;
  event_type: "page_view" | "click";
  page_url: string;
  timestamp: string;
  click_x: number | null;
  click_y: number | null;
  target_tag?: string | null;
  target_text?: string | null;
}

// Custom hook for Animated Counter
function useCountUp(end: number, duration = 1000): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (end === 0) {
      setValue(0);
      return;
    }
    startTime.current = null;
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };
    rafId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId.current);
  }, [end, duration]);

  return value;
}

const Sparkline = () => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
    <path d="M1 15L10 10L18 13L28 5L35 8L45 2L59 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionEvents, setSessionEvents] = useState<EventData[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  // Search and Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/sessions`);
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleRowClick = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsPanelOpen(true);
    setLoadingEvents(true);
    try {
      const { data } = await axios.get(`${API_BASE}/session/${sessionId}`);
      setSessionEvents(data);
    } catch (error) {
      console.error("Error fetching session events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s._id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessions, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / itemsPerPage));
  const currentSessions = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSessions = sessions.length;
  const totalEvents = sessions.reduce((acc, s) => acc + s.total_events, 0);
  const totalPageViews = sessions.reduce((acc, s) => acc + (s.page_views || 0), 0);
  const totalClicks = sessions.reduce((acc, s) => acc + (s.clicks || 0), 0);

  const stats = {
    totalSessions: useCountUp(totalSessions),
    totalEvents: useCountUp(totalEvents),
    totalPageViews: useCountUp(totalPageViews),
    totalClicks: useCountUp(totalClicks),
  };

  const formatDurationStr = (first: string, last: string) => {
    const diff = new Date(last).getTime() - new Date(first).getTime();
    if (diff < 1000) return "< 1s";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 px-5 animate-fade-in-up">
      {/* Top Controls mimicking the image */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-gray-900">Sessions</h1>
          <p className="text-sm text-gray-500">
            Track and analyze user sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-emerald-600" />
            May 23 - May 30, 2024
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          <button 
            onClick={fetchSessions}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-200 bg-white rounded-md p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Total Sessions</h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-gray-900">{stats.totalSessions.toLocaleString()}</div>
              <Sparkline />
            </div>
          </div>
          <div className="mt-4 text-xs">
            <span className="text-emerald-600 font-medium">↑ 12.5%</span> <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>

        <div className="border border-gray-200 bg-white rounded-md p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Total Events</h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-gray-900">{stats.totalEvents.toLocaleString()}</div>
              <Sparkline />
            </div>
          </div>
          <div className="mt-4 text-xs">
            <span className="text-emerald-600 font-medium">↑ 18.6%</span> <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>

        <div className="border border-gray-200 bg-white rounded-md p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Page Views</h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-gray-900">{stats.totalPageViews.toLocaleString()}</div>
              <Sparkline />
            </div>
          </div>
          <div className="mt-4 text-xs">
            <span className="text-emerald-600 font-medium">↑ 10.3%</span> <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>

        <div className="border border-gray-200 bg-white rounded-md p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Click Events</h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</div>
              <Sparkline />
            </div>
          </div>
          <div className="mt-4 text-xs">
            <span className="text-emerald-600 font-medium">↑ 15.7%</span> <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>
      </div>

      {/* Sessions Table Area */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-base font-semibold text-gray-900">All Sessions</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search session ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200">Session ID</th>
                <th className="px-6 py-3 border-b border-gray-200 text-center">Events</th>
                <th className="px-6 py-3 border-b border-gray-200 text-center">Pages</th>
                <th className="px-6 py-3 border-b border-gray-200">Start Time</th>
                <th className="px-6 py-3 border-b border-gray-200 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No sessions found.
                  </td>
                </tr>
              ) : (
                currentSessions.map((session, index) => {
                  const isSelected = selectedSessionId === session._id;
                  return (
                    <tr
                      key={session._id}
                      onClick={() => handleRowClick(session._id)}
                      className="cursor-pointer transition-colors hover:bg-gray-50 group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-emerald-600 font-medium flex items-center gap-3">
                        {/* Radio indicator */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </div>
                        {session._id.substring(0, 16)}...
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-900">
                        {session.total_events}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-900">
                        {session.unique_page_count || 1}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {session.first_event ? format(new Date(session.first_event), "MMM dd, hh:mm a") : "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {session.first_event && session.last_event ? formatDurationStr(session.first_event, session.last_event) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-gray-500 transition-colors bg-white px-3 py-1.5 border border-gray-200 rounded-md"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <span className="text-sm font-semibold text-gray-900">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors bg-white px-3 py-1.5 border border-gray-200 rounded-md"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide-over Panel for Details using Shadcn Sheet */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent className="w-[450px] sm:w-[540px] p-0 flex flex-col rounded-none border-l shadow-xl">
          <SheetHeader className="px-6 py-6 border-b border-gray-200">
            <SheetTitle>Session Details</SheetTitle>
            <div className="text-sm font-mono text-emerald-600 mt-1">
              {selectedSessionId}
            </div>
            
            {/* Quick stats row at top of panel */}
            {selectedSessionId && sessions.find(s => s._id === selectedSessionId) && (
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Duration</div>
                  <div className="font-medium mt-1">
                    {(() => {
                      const s = sessions.find(s => s._id === selectedSessionId);
                      return s?.first_event && s?.last_event ? formatDurationStr(s.first_event, s.last_event) : "-";
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Zap className="w-3 h-3"/> Events</div>
                  <div className="font-medium mt-1">
                    {sessions.find(s => s._id === selectedSessionId)?.total_events}
                  </div>
                </div>
              </div>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
            <h3 className="font-semibold text-sm mb-6">User Journey</h3>
            {loadingEvents ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading journey...</p>
              </div>
            ) : (
              <EventTimeline events={sessionEvents} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
