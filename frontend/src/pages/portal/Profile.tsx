import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    { label: "Name", value: user.name },
    { label: "Mobile", value: user.mobile },
    { label: "Email", value: user.email },
    { label: "Age", value: String(user.age) },
    { label: "Gender", value: user.gender },
    { label: "Area", value: user.area },
    { label: "Role", value: user.role },
  ];

  return (
    <div>
      <PageHeader title="Profile" description="Your APAD account details." />
      <Card className="max-w-md">
        <dl className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between py-4 first:pt-0 last:pb-0">
              <dt className="text-sm font-medium text-slate-500">{r.label}</dt>
              <dd className="text-sm font-semibold text-slate-900">{r.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
