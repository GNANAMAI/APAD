import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LinkButton } from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { apiPublic } from "../../lib/api";
import { saveFlow } from "../../lib/auth";
import { trackEvent } from "../../lib/analytics";
import type { AdWatchPayload } from "../../types/api";

export default function AdPreview() {
  const { token } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<AdWatchPayload | null>(null);

  useEffect(() => {
    if (!token) return;
    saveFlow({ token });
    trackEvent("preview_fetch", { token });
    apiPublic
      .get<AdWatchPayload>(`/api/ad/watch?token=${encodeURIComponent(token)}`)
      .then((r) => setPayload(r.data))
      .catch(() => setPayload(null));
  }, [token]);

  if (!token) return null;

  return (
    <div className="mx-auto max-w-lg animate-slide-up">
      <Card>
        {payload ? (
          <>
            <span className="badge-brand">Sponsored offer</span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              {payload.personalized_title}
            </h1>
            <img
              src={payload.image_url}
              alt=""
              className="mt-6 w-full rounded-2xl object-cover shadow-soft"
            />
            <p className="mt-4 text-slate-600">{payload.description}</p>
            <LinkButton
              to={`/ad-watch?token=${encodeURIComponent(token)}&gate=login`}
              fullWidth
              className="mt-8"
            >
              View offer
            </LinkButton>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-apad-200 border-t-apad-600" />
          </div>
        )}
      </Card>
    </div>
  );
}
