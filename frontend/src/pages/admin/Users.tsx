import { FormEvent, useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";
import type { User } from "../../types/api";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  age: 25,
  gender: "male",
  area: "",
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get<User[]>("/api/users").then((r) => setUsers(r.data));

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
      await api.post("/api/users", {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        age: Number(form.age),
        gender: form.gender,
        area: form.area,
      });
      setForm(emptyForm);
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Could not create user";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Users" description="Add people who can receive advertisements." />

      <Card title="Add user" className="mb-8">
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" required>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Mobile" required>
            <input
              className="input-field"
              inputMode="numeric"
              placeholder="9876543210"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Email" required>
            <input
              type="email"
              className="input-field"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </FormField>

          <FormField label="Age" required>
            <input
              type="number"
              min={1}
              max={120}
              className="input-field"
              value={form.age}
              onChange={(e) => set("age", Number(e.target.value))}
              required
            />
          </FormField>

          <FormField label="Gender" required>
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="any">Any</option>
            </select>
          </FormField>

          <FormField label="City" required className="sm:col-span-2">
            <input
              className="input-field"
              placeholder="Hyderabad"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              required
            />
          </FormField>

          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create user"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-600">Name</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Mobile</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Email</th>
              <th className="px-5 py-3 font-semibold text-slate-600">City</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-apad-50/30">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.mobile}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3 text-slate-600">{u.area}</td>
                <td className="px-5 py-3">
                  <span
                    className={`badge ${u.role === "admin" ? "bg-apad-100 text-apad-800" : "bg-slate-100 text-slate-600"}`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
