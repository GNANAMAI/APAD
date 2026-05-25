import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  required,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
