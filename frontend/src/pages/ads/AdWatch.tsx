import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdPlayer from "../../components/ads/AdPlayer";
import PageHeader from "../../components/ui/PageHeader";
import { apiPublic } from "../../lib/api";
import { getFlow, saveFlow } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import type { AdWatchPayload, SendOtpResponse } from "../../types/api";

type AdGate = "login" | "otp_request";

function parseGate(value: string | null): AdGate {
  return value === "otp_request" ? "otp_request" : "login";
}

export default function AdWatch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const flow = getFlow();
  const gate = parseGate(params.get("gate"));
  const token = params.get("token") || flow.token;
  const mobile = params.get("mobile") || flow.mobile;
  const [payload, setPayload] = useState<AdWatchPayload | null>(null);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const parts: string[] = [];
    if (token) parts.push(`token=${encodeURIComponent(token)}`);
    else if (mobile) parts.push(`mobile=${encodeURIComponent(mobile)}`);
    else {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    parts.push(`gate=${gate}`);
    apiPublic
      .get<AdWatchPayload>(`/api/ad/watch?${parts.join("&")}`)
      .then((r) => {
        setPayload(r.data);
        saveFlow({ mobile: r.data.user_mobile, token: token || undefined });
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "This offer is unavailable right now. Please try again.";
        setError(String(msg));
      });
  }, [token, mobile, gate]);

  const onComplete = async (watchDuration: number) => {
    if (completing) return;
    setCompleting(true);
    const resolvedMobile = mobile || payload?.user_mobile;
    try {
      await apiPublic.post("/api/ad/completed", {
        token: token || undefined,
        mobile: resolvedMobile,
        watch_duration: watchDuration,
        gate,
      });
      await trackEvent("ad_completed", { token: token || undefined });

      if (gate === "login") {
        navigate("/generate-otp");
        return;
      }

      const otpRes = await apiPublic.post<SendOtpResponse>("/api/otp/send-otp", {
        mobile: resolvedMobile,
        token: token || undefined,
      });
      saveFlow({
        mobile: resolvedMobile,
        token: token || undefined,
        otpForScreen: otpRes.data.otp_for_screen ?? undefined,
        maskedMobile: otpRes.data.masked_mobile,
      });
      navigate("/otp-verification");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Something went wrong. Please try again.";
      setError(String(msg));
      setCompleting(false);
    }
  };

  if (error) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-apad-200 border-t-apad-600" />
          <p className="mt-4 text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  const title =
    gate === "login" ? payload.campaign_name : "Verify to continue";
  const description =
    gate === "login"
      ? "Please watch the full message to continue."
      : "Watch this message to receive your verification code on SMS.";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={title} description={description} />
      <AdPlayer payload={payload} onComplete={onComplete} />
      {completing && (
        <p className="mt-4 text-center text-sm text-slate-500">Please wait…</p>
      )}
    </div>
  );
}
