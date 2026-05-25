import { Link, useLocation } from "react-router-dom";
import { config } from "../../lib/config";
import { useAuth } from "../../hooks/useAuth";
import { LinkButton } from "../ui/Button";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-apad-600 to-apad-400 text-sm font-bold text-white shadow-soft transition group-hover:shadow-glow">
            A
          </span>
          <span className="text-lg font-bold text-slate-900">
            {config.appName}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "nav-link-active" : ""}`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`nav-link ${location.pathname.startsWith("/admin") ? "nav-link-active" : ""}`}
                >
                  Admin
                </Link>
              )}
              <span className="hidden text-sm text-slate-500 sm:inline">
                Hi, <strong className="text-slate-700">{user.name.split(" ")[0]}</strong>
              </span>
              <button type="button" onClick={logout} className="btn-ghost text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "nav-link-active" : ""}`}
              >
                Login
              </Link>
              <LinkButton to="/register" className="!px-4 !py-2 text-sm">
                Get started
              </LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
