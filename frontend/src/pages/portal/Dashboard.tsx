import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { trackEvent } from "../../lib/analytics";
import type { Campaign } from "../../types/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    trackEvent("portal_view", { userId: user?.id });
    api.get<Campaign[]>("/api/campaigns").then((r) => setCampaigns(r.data.slice(0, 3)));
  }, [user?.id]);

  return (
    <div className="animate-fade-in">
      <div className="rounded-3xl bg-gradient-to-r from-apad-700 via-apad-600 to-indigo-600 px-8 py-10 text-white shadow-glow">
        <p className="text-sm font-medium text-apad-100">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold">{user?.name}</h1>
        <p className="mt-2 text-apad-100">
          {user?.area} · Your offers are ready
        </p>
      </div>

      <PageHeader
        className="mt-12"
        title="Your offers"
        description="Offers selected for your profile."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {campaigns.map((c) => (
          <article
            key={c.id}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
          >
            <img
              src={c.image_url}
              alt=""
              className="h-40 w-full object-cover transition group-hover:scale-105"
            />
            <div className="p-5">
              <h2 className="font-bold text-slate-900">{c.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {c.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        {[
          { to: "/offers", label: "All offers", icon: "🎁" },
          { to: "/recommendations", label: "For you", icon: "✨" },
          { to: "/profile", label: "Profile", icon: "👤" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition hover:border-apad-300 hover:text-apad-700"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
