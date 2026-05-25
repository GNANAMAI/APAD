import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import type { CampaignRecommendation } from "../../types/api";

export default function Recommendations() {
  const [items, setItems] = useState<CampaignRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CampaignRecommendation[]>("/api/campaigns/for-me")
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Recommended for you" />
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-500">No matching offers right now.</p>
      )}
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-soft"
          >
            <div>
              <span className="font-medium text-slate-800">{item.personalized_title}</span>
              <p className="text-sm text-slate-500">{item.name}</p>
            </div>
            <span className="badge-brand">Match</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
