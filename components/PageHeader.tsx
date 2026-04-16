import React from "react";
import Breadcrumb from "./Breadcrumb";

interface Props {
  crumbs?:       { label: string; href?: string }[];
  title:         string;
  subtitle?:     string;
  illustration?: React.ReactNode;
}

export default function PageHeader({ crumbs, title, subtitle, illustration }: Props) {
  return (
    <div className="mb-10">
      {crumbs && <Breadcrumb crumbs={crumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mt-8">
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-3 tracking-tight"
            style={{ color: "var(--ink)" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg" style={{ color: "var(--ink-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {illustration && (
          <div className="shrink-0 w-32 hidden sm:block">{illustration}</div>
        )}
      </div>
    </div>
  );
}
