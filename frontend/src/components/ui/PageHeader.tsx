interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

export default function PageHeader({ title, description, badge, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-8 animate-fade-in ${className}`}>
      {badge && <span className="badge-brand mb-3">{badge}</span>}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-xl text-lg text-slate-600">{description}</p>
      )}
    </div>
  );
}
