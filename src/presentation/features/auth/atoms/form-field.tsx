"use client";

import { Label } from "@/presentation/shared/ui/label";
import { Input } from "@/presentation/shared/ui/input";
import { LucideIcon } from "lucide-react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
}

export function FormField({
  label,
  icon: Icon,
  error,
  hint,
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-slate-700 font-medium">
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <Input
          id={fieldId}
          {...props}
          className={`h-12 ${Icon ? "pl-11" : ""} ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
