import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import PhoneInput from "../../components/ui/PhoneInput";
import { apiPublic } from "../../lib/api";
import { saveFlow } from "../../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const preset = (location.state as { mobile?: string })?.mobile || "";
  const [mobile, setMobile] = useState(preset);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await apiPublic.post<{
        exists: boolean;
        requires_admin_login?: boolean;
      }>("/api/login", { mobile });
      if (!data.exists) {
        setError("Mobile not registered. Please create an account first.");
        return;
      }
      if (data.requires_admin_login) {
        setError("This number is for admin. Use Admin login instead.");
        return;
      }
      saveFlow({ mobile });
      navigate(`/ad-watch?mobile=${encodeURIComponent(mobile)}&gate=login`);
    } catch {
      setError("Could not verify your number. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Enter your mobile number to view relevant offers and sign in securely."
    >
      <p className="mb-4 text-center text-sm text-slate-500">
        Admin?{" "}
        <Link to="/admin/login" className="font-medium text-apad-600 hover:text-apad-700">
          Admin login
        </Link>
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Mobile number
          </label>
          <PhoneInput value={mobile} onChange={setMobile} required />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Please wait…" : "Continue"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{" "}
        <Link to="/register" className="font-semibold text-apad-600 hover:text-apad-700">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
