import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";

const cards = [
  { to: "/admin/campaigns", title: "Advertisements", desc: "Create ads & audience rules", color: "from-apad-600 to-indigo-600" },
  { to: "/admin/users", title: "Users", desc: "Create accounts & view audience", color: "from-indigo-500 to-indigo-600" },
  { to: "/admin/analytics", title: "Analytics", desc: "Funnel events & conversions", color: "from-violet-500 to-violet-600" },
];

export default function AdminHome() {
  return (
    <div>
      <PageHeader
        badge="Admin console"
        title="Control center"
        description="Create advertisements, set audience rules, manage users, and view performance."
      />
      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`rounded-2xl bg-gradient-to-br ${c.color} p-6 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-glow`}
          >
            <h2 className="text-lg font-bold">{c.title}</h2>
            <p className="mt-2 text-sm text-white/80">{c.desc}</p>
            <span className="mt-4 inline-block text-sm font-semibold">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
