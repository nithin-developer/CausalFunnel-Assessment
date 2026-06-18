import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { RefreshCcw, ChevronDown, Info, Download } from "lucide-react";

interface ClickEvent {
  y: number;
  x: number;
  _id: string;
  session_id: string;
  page_url: string;
  click_x: number;
  click_y: number;
  timestamp: string;
  target_text?: string;
  target_tag?: string;
}

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

export default function Heatmap() {
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [showClicks, setShowClicks] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchClicks(selectedPage);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/pages");
      setPages(res.data);
      if (res.data.length > 0) {
        setSelectedPage(res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const fetchClicks = async (url: string) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/heatmap?page=${encodeURIComponent(url)}`,
      );
      setClicks(res.data);
    } catch (error) {
      console.error("Error fetching clicks:", error);
    }
  };

  const totalClicks = clicks.length;
  const uniqueSessions = new Set(clicks.map((c) => c.session_id)).size;
  const avgClicks =
    uniqueSessions > 0 ? (totalClicks / uniqueSessions).toFixed(2) : "0.00";

  const targetCounts = clicks.reduce((acc: Record<string, number>, c) => {
    if (c.target_text && c.target_text.trim() !== "") {
      acc[c.target_text] = (acc[c.target_text] || 0) + 1;
    } else if (c.target_tag) {
      acc[`<${c.target_tag}>`] = (acc[`<${c.target_tag}>`] || 0) + 1;
    }
    return acc;
  }, {});

  const topClicked = Object.entries(targetCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percentage: ((count / Math.max(1, totalClicks)) * 100).toFixed(1),
    }));

  const dotColors = [
    "bg-yellow-400",
    "bg-teal-400",
    "bg-pink-400",
    "bg-red-500",
    "bg-orange-400",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 px-4 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-gray-900">
            Heatmap
          </h1>
          <p className="text-sm text-gray-500">
            Visualize user clicks on your pages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchClicks(selectedPage)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 mb-6 flex flex-col lg:flex-row items-center divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        <div className="w-full lg:w-1/3 px-4 py-2 lg:py-0">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">
            Select Page
          </label>
          <div className="relative">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer text-gray-900"
            >
              {pages.length === 0 && (
                <option value="">No tracked pages yet</option>
              )}
              {pages.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/4 px-6 py-4 lg:py-2">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">
            Total Clicks
          </h3>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {useCountUp(totalClicks).toLocaleString()}
            </div>
          </div>
          <div className="mt-1 text-xs">
            <span className="text-emerald-600 font-medium">↑ 15.7%</span>{" "}
            <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>

        <div className="w-full lg:w-1/4 px-6 py-4 lg:py-2">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">
            Unique Clicks
          </h3>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {useCountUp(uniqueSessions).toLocaleString()}
            </div>
          </div>
          <div className="mt-1 text-xs">
            <span className="text-emerald-600 font-medium">↑ 12.4%</span>{" "}
            <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>

        <div className="w-full lg:w-1/6 px-6 py-4 lg:py-2">
          <h3 className="text-xs font-semibold text-gray-500 mb-1">
            Avg. Clicks / Session
          </h3>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">{avgClicks}</div>
          </div>
          <div className="mt-1 text-xs">
            <span className="text-emerald-600 font-medium">↑ 8.6%</span>{" "}
            <span className="text-gray-400">vs last 7 days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-md p-6 h-fit flex flex-col gap-6">
          <h2 className="text-sm font-bold text-gray-900">Heatmap Controls</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-3 block flex justify-between">
              <span>Intensity</span>
            </label>
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500 relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-gray-300 rounded-full shadow-sm"></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mt-2 uppercase tracking-wider">
              <span>Low</span>
              <span className="text-black">High</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-3 block">
              Top Clicked Areas
            </label>
            <div className="space-y-3">
              {topClicked.length === 0 ? (
                <div className="text-xs text-gray-400 italic">
                  No click details available.
                </div>
              ) : (
                topClicked.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${dotColors[idx % dotColors.length]}`}
                      ></div>
                      <span className="text-gray-400 font-medium shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 truncate font-medium">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-gray-500 font-medium shrink-0 ml-2">
                      {item.percentage}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => {
              const img = document.querySelector(
                'img[alt="Tracked Page Screenshot"]',
              ) as HTMLImageElement;
              if (!img) return;

              const canvas = document.createElement("canvas");

              canvas.width = 1536;

              canvas.height = (img.naturalHeight / img.naturalWidth) * 1536;

              const ctx = canvas.getContext("2d");
              if (!ctx) return;

              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

              if (showClicks) {
                clicks.forEach((click) => {
                  const x = click.click_x || click.x;
                  const y = click.click_y || click.y;

                  const r = 32;
                  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                  gradient.addColorStop(0, "rgba(255,0,0,1)");
                  gradient.addColorStop(0.3, "rgba(255,165,0,0.8)");
                  gradient.addColorStop(0.5, "rgba(0,255,0,0.5)");
                  gradient.addColorStop(0.7, "rgba(0,0,255,0.3)");
                  gradient.addColorStop(1, "transparent");

                  ctx.fillStyle = gradient;
                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, Math.PI * 2);
                  ctx.fill();
                });
              }

              const link = document.createElement("a");
              link.download = `heatmap-${selectedPage.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
              link.href = canvas.toDataURL("image/png");
              link.click();
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Download Heatmap
          </button>
        </div>

        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Click Heatmap Preview
              <Info className="w-4 h-4 text-gray-400" />
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">
                {totalClicks.toLocaleString()} clicks
              </span>
              <button
                onClick={() => setShowClicks(!showClicks)}
                className={`flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold transition-colors ${showClicks ? "bg-gray-50 text-gray-900" : "bg-white text-gray-500"}`}
              >
                <div
                  className={`w-4 h-4 flex items-center justify-center rounded border ${showClicks ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300"}`}
                >
                  {showClicks && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                Show Clicks
              </button>
            </div>
          </div>

          <div className="flex-1 bg-gray-50 relative overflow-auto p-4 flex justify-center">
            <div
              className="relative shadow-sm border border-gray-200 bg-white"
              style={{ width: "100%", maxWidth: "1200px" }}
            >
              <img
                src="/demo_screenshot.png"
                alt="Tracked Page Screenshot"
                className="w-full h-auto opacity-90"
              />

              {showClicks && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  {clicks.map((click) => {
                    const xPercent = ((click.click_x || click.x) / 1536) * 100;

                    return (
                      <div
                        key={click._id}
                        className="absolute w-16 h-16 rounded-full animate-scale-in opacity-90 shadow-2xl"
                        style={{
                          left: `calc(${xPercent}% - 32px)`,
                          top: `calc(${click.click_y || click.y}px - 32px)`,
                          background:
                            "radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(255,165,0,0.8) 30%, rgba(0,255,0,0.5) 50%, rgba(0,0,255,0.3) 70%, transparent 100%)",
                          filter: "blur(4px)",
                          animationDelay: `${Math.random() * 500}ms`,
                        }}
                        title={`Clicked at ${new Date(click.timestamp).toLocaleTimeString()}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            Heatmap shows areas with more user clicks. Red areas represent the
            most popular sections.
          </div>
        </div>
      </div>
    </div>
  );
}
