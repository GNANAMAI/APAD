import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const links = [
  { to: "/admin", label: "Overview", icon: "◉" },
  { to: "/admin/campaigns", label: "Advertisements", icon: "◎" },
  { to: "/admin/users", label: "Users", icon: "◇" },
  { to: "/admin/analytics", label: "Analytics", icon: "▣" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="page-bg mesh-bg min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="card sticky top-24 !p-4">
            <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin
            </p>
            <nav className="space-y-1">
              {links.map((l) => {
                const active =
                  l.to === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-apad-600 text-white shadow-soft"
                        : "text-slate-600 hover:bg-apad-50 hover:text-apad-700"
                    }`}
                  >
                    <span className="text-xs opacity-80">{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
