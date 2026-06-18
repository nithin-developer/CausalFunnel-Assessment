import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MousePointerClick } from "lucide-react";

const navItems = [
  { to: "/", label: "Sessions", icon: LayoutDashboard, end: true },
  { to: "/heatmap", label: "Heatmap", icon: MousePointerClick, end: false },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="
        fixed top-4 left-4 bottom-4 w-[252px] z-50
        rounded-2xl overflow-hidden
        bg-white/80 backdrop-blur-xl
        border border-slate-200/60
        shadow-sm
        flex flex-col
        animate-slide-in-left
      "
    >
      {/* Brand */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div
          className="
            w-10 h-10 rounded-xl
            bg-primary
            flex items-center justify-center
            text-primary-foreground font-extrabold text-sm
            shadow-sm
            shrink-0
          "
        >
          CF
        </div>
        <div className="flex flex-col">
          <span
            className="text-sm font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "var(--font-family-heading)" }}
          >
            CausalFunnel
          </span>
          <span className="text-[0.7rem] font-medium text-slate-500">
            User Analytics
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-100" />

      {/* Navigation */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Analytics
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`
                  group relative flex items-center gap-3
                  px-4 py-2.5 rounded-xl
                  text-[0.82rem] font-medium
                  transition-all duration-200 ease-out
                  no-underline
                  ${
                    isActive
                      ? "bg-slate-100 text-primary font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}

                <span className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <Icon className="w-4 h-4" />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="p-4">
        <div
          className="
            rounded-xl p-4 text-center
            bg-slate-50
            border border-slate-100
          "
        >
          <p className="text-[0.7rem] text-slate-500 mb-1">
            CausalFunnel Analytics
          </p>
          <span className="text-[0.7rem] font-bold text-primary">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
}
