import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteDetailView } from "@/components/destination/route-detail-view";
import { getRouteDetail } from "@/lib/api";
import { destinationBasePath, sectionHref } from "@/lib/destination/sections";

/**
 * The standalone route page: what a hard load or a shared `.../routes/[id]` link
 * resolves to (the drawer intercept only fires on soft navigation from the
 * list). It renders inside the destination shell, so the rail stays put and the
 * back link returns to the comparison list.
 */
export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string; id: string }>;
}) {
  const { citizenship, destination, id } = await params;
  const route = await getRouteDetail(id);
  if (!route) {
    notFound();
  }

  const routesHref = sectionHref(destinationBasePath(citizenship, destination), "routes");

  return (
    <div className="space-y-8">
      <Link
        href={routesHref}
        className="inline-flex text-sm font-medium text-(--brand) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
      >
        ← Back to routes
      </Link>
      <RouteDetailView route={route} />
    </div>
  );
}
