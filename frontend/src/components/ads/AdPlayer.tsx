import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_FALLBACK_VIDEO, FALLBACK_AD_VIDEOS } from "../../lib/fallbackVideos";
import type { AdWatchPayload } from "../../types/api";

interface Props {
  payload: AdWatchPayload;
  onComplete: (watchDuration: number) => void;
}

export default function AdPlayer({ payload, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const minSeconds = payload.min_watch_seconds;
  const isVideo = payload.creative_type === "video";

  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);
  const candidates = useMemo(() => {
    const primarySrc = payload.creative_url?.trim() || "";
    const isBlockedGoogle = primarySrc.includes("gtv-videos-bucket");
    return [
      ...(primarySrc && !isBlockedGoogle ? [primarySrc] : []),
      ...FALLBACK_AD_VIDEOS.filter((u) => u !== primarySrc),
    ];
  }, [payload.creative_url, payload.campaign_id]);
  const videoSrc = candidates[srcIndex] || DEFAULT_FALLBACK_VIDEO;

  const tryComplete = useCallback(
    (watched: number) => {
      if (doneRef.current) return;
      const w = Math.floor(watched);
      if (w < minSeconds) return;

      doneRef.current = true;
      setDone(true);
      setSeconds(w);
      onCompleteRef.current(w);
    },
    [minSeconds]
  );

  // Image ads: count seconds on screen
  useEffect(() => {
    if (isVideo) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        tryComplete(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isVideo, tryComplete]);

  // Video: poll while playing (backup if timeupdate is sparse)
  useEffect(() => {
    if (!isVideo) return;
    const tick = () => {
      const v = videoRef.current;
      if (!v || v.paused || doneRef.current) return;
      setSeconds(v.currentTime);
      tryComplete(v.currentTime);
    };
    const id = setInterval(tick, 400);
    return () => clearInterval(id);
  }, [isVideo, tryComplete]);

  // Muted autoplay when allowed (user can unmute via controls)
  useEffect(() => {
    if (!isVideo) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const playPromise = v.play();
    if (playPromise) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => {
          /* Browser blocked autoplay — user must press play */
        });
    }
  }, [isVideo, videoSrc]);

  useEffect(() => {
    if (!isVideo) return;
    setVideoError(false);
    setPlaying(false);
    setSeconds(0);
    doneRef.current = false;
    setDone(false);
  }, [isVideo, videoSrc, payload.campaign_id, srcIndex]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setSeconds(v.currentTime);
    tryComplete(v.currentTime);
  };

  const progress = Math.min(100, (seconds / minSeconds) * 100);
  const remaining = Math.max(0, minSeconds - Math.floor(seconds));

  return (
    <div className="card overflow-hidden !p-0">
      <div className="border-b border-slate-100 bg-gradient-to-r from-apad-600 to-apad-500 px-6 py-4 text-white">
        <span className="badge bg-white/20 text-white">Sponsored</span>
        <h2 className="mt-2 text-xl font-bold">{payload.personalized_title}</h2>
        <p className="mt-1 text-sm text-apad-100">{payload.description}</p>
      </div>

      <div className="p-4">
        {isVideo && !videoSrc ? (
          <p className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm text-slate-600">
            This video is unavailable. Please try again later.
          </p>
        ) : isVideo ? (
          <>
            <video
              key={`${payload.campaign_id}-${videoSrc}`}
              ref={videoRef}
              src={videoSrc}
              poster={payload.image_url}
              className="aspect-video w-full rounded-xl bg-black object-contain shadow-inner"
              controls
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedData={() => setVideoError(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                const v = videoRef.current;
                tryComplete(v?.duration ?? minSeconds);
              }}
              onError={() => {
                if (srcIndex < candidates.length - 1) {
                  setSrcIndex((i) => i + 1);
                  return;
                }
                setVideoError(true);
              }}
            />
            {!playing && !done && !videoError && (
              <p className="mt-2 text-center text-sm font-medium text-apad-600">
                Tap play and watch for at least {minSeconds} seconds
              </p>
            )}
            {videoError && (
              <p className="mt-2 text-center text-sm text-amber-700">
                Video could not load. Check your network or try again.{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => {
                    setVideoError(false);
                    setSrcIndex(0);
                  }}
                >
                  Retry
                </button>
              </p>
            )}
          </>
        ) : (
          <img
            src={payload.creative_url || payload.image_url}
            alt={payload.campaign_name}
            className="w-full rounded-xl object-cover shadow-inner"
          />
        )}

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-500">Watch progress</span>
            <span className="font-medium text-apad-600">
              {Math.floor(seconds)}s / {minSeconds}s required
              {!done && remaining > 0 && isVideo && playing && (
                <span className="text-slate-400"> · {remaining}s left</span>
              )}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-apad-500 to-apad-400 transition-all duration-300"
              style={{ width: `${done ? 100 : progress}%` }}
            />
          </div>
          {done && (
            <p className="mt-3 text-center text-sm font-medium text-emerald-600">
              Thank you. Redirecting…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
