import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { LinkButton } from "../../components/ui/Button";
import { getFlow, saveFlow } from "../../lib/auth";

export default function LinkComplete() {
  const [params] = useSearchParams();
  const flow = getFlow();
  const mobile = params.get("mobile") || flow.mobile;
  const masked = flow.maskedMobile;

  if (mobile) {
    saveFlow({ mobile, token: flow.token, fromLogin: true, maskedMobile: masked });
  }

  return (
    <AuthLayout
      title="Code sent"
      subtitle={
        masked
          ? `We sent a verification code to ${masked}.`
          : "We sent a verification code to your mobile number."
      }
    >
      <p className="text-center text-sm text-slate-600">
        Open the APAD website on your phone or computer, go to sign in, and enter the
        code you received by SMS.
      </p>
      <LinkButton to="/otp-verification" fullWidth className="mt-8">
        Enter verification code
      </LinkButton>
      <Link
        to="/login"
        className="mt-4 block text-center text-sm font-medium text-apad-600 hover:text-apad-700"
      >
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
