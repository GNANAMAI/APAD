import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import PhoneInput from "../../components/ui/PhoneInput";
import { apiPublic } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { AuthResponse } from "../../types/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await apiPublic.post<AuthResponse>("/api/auth/admin-login", {
        mobile,
        password,
      });
      login(data.access_token, data.user);
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Invalid mobile or password";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin sign in" subtitle="Mobile and password only.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Mobile</label>
          <PhoneInput value={mobile} onChange={setMobile} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        End user?{" "}
        <Link to="/login" className="font-medium text-apad-600 hover:text-apad-700">
          Consumer login
        </Link>
      </p>
    </AuthLayout>
  );
}
