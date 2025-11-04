"use client";

interface PageHeaderWithActionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export function PageHeaderWithAction({
  title,
  description,
  action,
  breadcrumbs,
}: PageHeaderWithActionProps) {
  return (
    <div className="space-y-4">
      {breadcrumbs && <div>{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="text-slate-600 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
