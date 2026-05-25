import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import type { Campaign } from "../../types/api";
import { useAuth } from "../../hooks/useAuth";

export default function Offers() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    api.get<Campaign[]>("/api/campaigns").then((r) => setCampaigns(r.data));
  }, []);

  return (
    <div>
      <PageHeader title="Your offers" description={`Curated for ${user?.name}`} />
      <div className="grid gap-6 sm:grid-cols-2">
        {campaigns.map((c) => (
          <div key={c.id} className="card">
            <span className="badge-brand">Limited</span>
            <h2 className="mt-3 text-lg font-bold text-slate-900">
              {c.title_template}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{c.promo_suffix}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
