import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import OtpInput from "../../components/otp/OtpInput";
import AuthLayout from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { apiPublic } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getFlow, clearFlow, saveFlow } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import type { AuthResponse, SendOtpResponse } from "../../types/api";

const RESEND_COOLDOWN_SEC = 60;
const STATUS_POLL_MS = 4000;

interface AdFlowStatus {
  login_ad_completed: boolean;
  otp_ad_completed: boolean;
  otp_sent: boolean;
}

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const flow = getFlow();
  const locationState = location.state as {
    awaitingSmsLink?: boolean;
    smsPreview?: string | null;
  } | null;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<AdFlowStatus | null>(null);

  const statusQuery = flow.token
    ? `token=${encodeURIComponent(flow.token)}`
    : flow.mobile
      ? `mobile=${encodeURIComponent(flow.mobile)}`
      : null;

  const fetchStatus = useCallback(async (): Promise<AdFlowStatus | null> => {
    if (!statusQuery) return null;
    const { data } = await apiPublic.get<AdFlowStatus>(
      `/api/ad/status?${statusQuery}`
    );
    return data;
  }, [statusQuery]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

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
        const data = await fetchStatus();
        if (!data) {
          setChecking(false);
          return;
        }
        setStatus(data);
        if (data.otp_sent || data.otp_ad_completed) {
          setChecking(false);
          return;
        }
        if (!data.login_ad_completed && !locationState?.awaitingSmsLink) {
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

  useEffect(() => {
    if (checking || flow.otpForScreen || status?.otp_sent) return;
    if (!statusQuery) return;

    const poll = async () => {
      try {
        const data = await fetchStatus();
        if (data) setStatus(data);
      } catch {
        /* ignore poll errors */
      }
    };

    const id = window.setInterval(poll, STATUS_POLL_MS);
    return () => window.clearInterval(id);
  }, [checking, flow.otpForScreen, status?.otp_sent, statusQuery, fetchStatus]);

  const resendOtp = useCallback(async () => {
    if (!flow.mobile || resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const { data } = await apiPublic.post<SendOtpResponse>("/api/otp/send-otp", {
        mobile: flow.mobile,
        token: flow.token,
      });
      saveFlow({
        maskedMobile: data.masked_mobile,
        otpForScreen: data.otp_for_screen ?? undefined,
      });
      setResendCooldown(RESEND_COOLDOWN_SEC);
      const refreshed = await fetchStatus();
      if (refreshed) setStatus(refreshed);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Could not resend code. Please try again.";
      setError(String(msg));
    } finally {
      setResending(false);
    }
  }, [flow.mobile, flow.token, resendCooldown, resending, fetchStatus]);

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

  const showPocOtp = Boolean(flow.otpForScreen);
  const awaitingLink =
    !showPocOtp &&
    !status?.otp_sent &&
    !status?.otp_ad_completed &&
    (locationState?.awaitingSmsLink || flow.loginSmsPreview);

  const smsPreview =
    locationState?.smsPreview || flow.loginSmsPreview || null;

  const canEnterOtp =
    showPocOtp || status?.otp_sent || status?.otp_ad_completed;

  return (
    <AuthLayout
      title="Enter verification code"
      subtitle={
        awaitingLink
          ? "Open the offer link we sent by SMS, watch the messages, then enter your code here."
          : flow.maskedMobile
            ? `We sent a 6-digit code to ${flow.maskedMobile}`
            : "Enter the 6-digit code sent to your mobile number"
      }
    >
      {awaitingLink && (
        <div className="mb-6 rounded-2xl border border-apad-200 bg-apad-50 px-4 py-3 text-sm text-apad-900">
          <p className="font-medium">Waiting for you to complete the offer</p>
          <p className="mt-1 text-apad-800">
            Tap the link in your text message, watch both sponsored messages, then
            return here to enter the code.
          </p>
        </div>
      )}

      {smsPreview && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          <p className="font-medium text-slate-800">Development — offer SMS preview</p>
          <p className="mt-2 break-all font-mono">{smsPreview}</p>
        </div>
      )}

      {showPocOtp && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">Development mode</p>
          <p className="mt-1 text-sm text-amber-900">
            Your code is{" "}
            <span className="font-mono font-semibold tracking-widest">
              {flow.otpForScreen}
            </span>
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
        <Button
          type="submit"
          fullWidth
          disabled={loading || otp.length < 6 || !canEnterOtp}
        >
          {loading ? "Signing you in…" : "Continue"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-slate-500">
            Resend code in {resendCooldown}s
          </p>
        ) : (
          <button
            type="button"
            onClick={resendOtp}
            disabled={resending || !status?.otp_ad_completed}
            className="text-sm font-medium text-apad-600 hover:text-apad-700 disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
        {!status?.otp_ad_completed && !resending && (
          <p className="mt-2 text-xs text-slate-500">
            Resend is available after you finish the offer from your SMS link.
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
