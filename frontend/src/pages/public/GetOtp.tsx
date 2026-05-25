import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { apiPublic } from "../../lib/api";
import { saveFlow } from "../../lib/auth";

export default function GetOtp() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("9876543210");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await apiPublic.post("/api/login", { mobile });
      if (!data.exists) {
        setError("User not found. Register first.");
        return;
      }
      saveFlow({ mobile });
      navigate(`/ad-watch?mobile=${encodeURIComponent(mobile)}&gate=login`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quick access"
      subtitle="Enter your registered mobile number to continue."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Mobile</label>
          <input
            className="input-field"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Please wait…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}
