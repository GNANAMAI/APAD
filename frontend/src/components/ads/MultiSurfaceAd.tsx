interface Props {
  title: string;
  imageUrl: string;
  compact?: boolean;
}

export default function MultiSurfaceAd({ title, imageUrl, compact }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-apad-100 bg-gradient-to-br from-apad-50 to-white shadow-soft ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <span className="text-xs font-bold uppercase tracking-wider text-apad-600">
        Sponsored
      </span>
      <p className={`mt-1 font-bold text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
        {title}
      </p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className={`mt-3 w-full rounded-lg object-cover ${compact ? "h-20" : "h-28"}`}
        />
      )}
    </div>
  );
}
