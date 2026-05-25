import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { config } from "../../lib/config";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md animate-slide-up">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-apad-600"
        >
          <span aria-hidden>←</span> Back to home
        </Link>
        <div className="card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-apad-600 to-apad-400 text-lg font-bold text-white shadow-soft">
              A
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-apad-600">
                {config.appName}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            </div>
          </div>
          {subtitle && <p className="-mt-2 mb-6 text-sm text-slate-500">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
