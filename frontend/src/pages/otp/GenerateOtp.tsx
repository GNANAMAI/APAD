import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import { apiPublic } from "../../lib/api";
import { getFlow } from "../../lib/auth";

export default function GenerateOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow = getFlow();
  const fromLogin =
    searchParams.get("from") === "login" || flow.fromLogin === true;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      if (!flow.mobile && !flow.token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }
      try {
        const q = flow.token
          ? `token=${encodeURIComponent(flow.token)}`
          : `mobile=${encodeURIComponent(flow.mobile!)}`;
        const { data } = await apiPublic.get<{
          login_ad_completed: boolean;
        }>(`/api/ad/status?${q}`);
        if (!data.login_ad_completed) {
          setError("Please complete the sponsored message to continue.");
          return;
        }
        setReady(true);
      } catch {
        setError("Unable to continue. Please sign in again.");
      }
    };
    check();
  }, []);

  const continueFlow = () => {
    const parts = flow.token
      ? [`token=${encodeURIComponent(flow.token)}`]
      : [`mobile=${encodeURIComponent(flow.mobile!)}`];
    parts.push("gate=otp_request");
    if (fromLogin) parts.push("from=login");
    navigate(`/ad-watch?${parts.join("&")}`);
  };

  if (error) {
    return (
      <AuthLayout title="Sign in" subtitle="">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          {error}
        </p>
        <Link to="/login" className="mt-4 block text-center text-apad-600">
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mobile verification"
      subtitle="Watch a brief sponsored message. We will then send a one-time password to your registered number."
    >
      <Button type="button" fullWidth disabled={!ready} onClick={continueFlow}>
        {ready ? "Continue" : "Please wait…"}
      </Button>
    </AuthLayout>
  );
}
