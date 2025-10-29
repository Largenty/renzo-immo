import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-slate-600 mt-2">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
