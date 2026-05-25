interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <div className={`card animate-slide-up ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
