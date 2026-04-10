import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": c.label,
      ...(c.href ? { "item": `https://crystalkey.ca${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-faint)" }}>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">›</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:underline transition-colors"
                style={{ color: "var(--ink-faint)" }}>
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium" style={{ color: "var(--ink-mid)" }}>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
