import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { api } from "../../lib/api";
import type { AnalyticsRow } from "../../types/api";

export default function Analytics() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);

  useEffect(() => {
    api.get<AnalyticsRow[]>("/api/analytics").then((r) => setRows(r.data));
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" description="Login and ad funnel stats." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Card key={r.event_type} className="text-center">
            <p className="text-3xl font-extrabold text-apad-600">{r.count}</p>
            <p className="mt-2 text-sm font-medium text-slate-600">{r.event_type}</p>
          </Card>
        ))}
      </div>
      {rows.length === 0 && (
        <p className="mt-8 text-center text-slate-500">No events yet — run a user flow first.</p>
      )}
    </div>
  );
}
