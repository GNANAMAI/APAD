import { FormEvent, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import type { Campaign } from "../../types/api";

const initialForm = {
  name: "New Advertisement",
  title_template: "Special offer — limited time",
  description: "Exclusive deal. Book today and save.",
  image_url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf0?w=800",
  creative_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  creative_type: "video",
  min_watch_seconds: 5,
  promo_suffix: "Limited time offer — claim now",
  priority: 50,
  min_age: 18,
  max_age: 60,
  gender: "any",
  area: "any",
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get<Campaign[]>("/api/campaigns").then((r) => setCampaigns(r.data));

  useEffect(() => {
    load();
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/campaigns/create", {
        name: form.name,
        title_template: form.title_template,
        description: form.description,
        image_url: form.image_url,
        creative_url: form.creative_url,
        creative_type: form.creative_type,
        min_watch_seconds: Number(form.min_watch_seconds),
        promo_suffix: form.promo_suffix,
        priority: Number(form.priority),
        targeting_rules: [
          {
            min_age: Number(form.min_age),
            max_age: Number(form.max_age),
            gender: form.gender,
            area: form.area,
          },
        ],
      });
      await load();
      setForm(initialForm);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Could not create advertisement";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Advertisements"
        description="Create ads with fixed copy. Users are matched by age, gender, and city only."
      />

      <Card title="New advertisement" className="mb-8">
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <p className="text-sm font-semibold text-slate-700 sm:col-span-2">Ad content</p>

          <FormField label="Advertisement name" required className="sm:col-span-2">
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Headline (shown on the ad)" required className="sm:col-span-2">
            <input
              className="input-field"
              placeholder="e.g. 30% off Bali getaways"
              value={form.title_template}
              onChange={(e) => set("title_template", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Description" required className="sm:col-span-2">
            <textarea
              className="input-field min-h-[72px]"
              placeholder="Offer details shown under the video"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </FormField>

          <FormField label="SMS line (optional)" className="sm:col-span-2">
            <input
              className="input-field"
              placeholder="Short text sent with OTP"
              value={form.promo_suffix}
              onChange={(e) => set("promo_suffix", e.target.value)}
            />
          </FormField>

          <FormField label="Preview image URL" required className="sm:col-span-2">
            <input
              type="url"
              className="input-field"
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Video URL" required className="sm:col-span-2">
            <input
              type="url"
              className="input-field"
              value={form.creative_url}
              onChange={(e) => set("creative_url", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Ad type">
            <select
              className="input-field"
              value={form.creative_type}
              onChange={(e) => set("creative_type", e.target.value)}
            >
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </FormField>

          <FormField label="Min watch (seconds)" required>
            <input
              type="number"
              min={1}
              max={120}
              className="input-field"
              value={form.min_watch_seconds}
              onChange={(e) => set("min_watch_seconds", Number(e.target.value))}
              required
            />
          </FormField>

          <FormField label="Priority (if several ads match one user)">
            <input
              type="number"
              min={0}
              max={100}
              className="input-field"
              value={form.priority}
              onChange={(e) => set("priority", Number(e.target.value))}
            />
          </FormField>

          <p className="border-t border-slate-100 pt-4 text-sm font-semibold text-slate-700 sm:col-span-2">
            Audience matching
          </p>
          <p className="-mt-2 text-xs text-slate-500 sm:col-span-2">
            Uses the user&apos;s profile from registration (age, gender, city). Leave city blank or
            &quot;any&quot; for all cities.
          </p>

          <FormField label="Min age">
            <input
              type="number"
              min={0}
              max={120}
              className="input-field"
              value={form.min_age}
              onChange={(e) => set("min_age", Number(e.target.value))}
            />
          </FormField>

          <FormField label="Max age">
            <input
              type="number"
              min={0}
              max={120}
              className="input-field"
              value={form.max_age}
              onChange={(e) => set("max_age", Number(e.target.value))}
            />
          </FormField>

          <FormField label="Gender">
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField label="City">
            <input
              className="input-field"
              placeholder="any"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
            />
          </FormField>

          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create advertisement"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Active advertisements">
        {campaigns.length === 0 ? (
          <p className="text-sm text-slate-500">No advertisements yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.title_template}</p>
                  <p className="text-xs text-slate-400">
                    ID {c.id} · priority {c.priority} · {c.min_watch_seconds}s watch
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
