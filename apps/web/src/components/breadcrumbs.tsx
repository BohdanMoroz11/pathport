import Link from "next/link";

export type Crumb = { label: string; href?: string };

/** Compact navigation trail for the citizenship → destination → route drill-down. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-(--text-2)">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-(--brand) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-(--text)">
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
