import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OtpInput from "../../components/otp/OtpInput";
import AuthLayout from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { apiPublic } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getFlow, clearFlow } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import type { AuthResponse } from "../../types/api";

export default function OtpVerification() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const flow = getFlow();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const guard = async () => {
      if (!flow.mobile && !flow.token) {
        setError("Your session has expired. Please sign in again.");
        setChecking(false);
        return;
      }
      if (flow.otpForScreen) {
        setChecking(false);
        return;
      }
      try {
        const q = flow.token
          ? `token=${encodeURIComponent(flow.token)}`
          : `mobile=${encodeURIComponent(flow.mobile!)}`;
        const { data } = await apiPublic.get<{ otp_ad_completed: boolean }>(
          `/api/ad/status?${q}`
        );
        if (!data.otp_ad_completed) {
          navigate("/generate-otp", { replace: true });
          return;
        }
      } catch {
        setError("Unable to verify your session. Please sign in again.");
      }
      setChecking(false);
    };
    guard();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!flow.mobile) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await apiPublic.post<AuthResponse>("/api/verify-otp", {
        mobile: flow.mobile,
        otp,
      });
      login(data.access_token, data.user);
      clearFlow();
      await trackEvent("portal_view", { userId: data.user.id });
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Invalid or expired code. Please try again.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-apad-200 border-t-apad-600" />
      </div>
    );
  }

  if (error && !flow.mobile) {
    return (
      <AuthLayout title="Enter verification code" subtitle="">
        <p className="text-center text-sm text-red-600">{error}</p>
        <Link to="/login" className="mt-4 block text-center text-apad-600">
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Enter verification code"
      subtitle={
        flow.maskedMobile
          ? `We sent a 6-digit code to ${flow.maskedMobile}`
          : "Enter the 6-digit code sent to your mobile number"
      }
    >
      {flow.otpForScreen && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">APAD</p>
          <p className="mt-1 text-sm text-slate-800">
            Your verification code is{" "}
            <span className="font-mono font-semibold tracking-widest">{flow.otpForScreen}</span>
            . Valid for a few minutes. Do not share this code.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={loading || otp.length < 6}>
          {loading ? "Signing you in…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}
