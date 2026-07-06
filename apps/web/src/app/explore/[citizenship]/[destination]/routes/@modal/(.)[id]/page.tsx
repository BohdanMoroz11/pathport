import { notFound } from "next/navigation";
import { Drawer } from "@/components/destination/drawer";
import { RouteDetailView } from "@/components/destination/route-detail-view";
import { getRouteDetail } from "@/lib/api";

/**
 * Intercepts `.../routes/[id]` on soft navigation from the list and shows the
 * route in the peek drawer instead of a full page. The identical detail body is
 * rendered by the sibling `[id]/page.tsx` on a hard load — same data, same view,
 * different chrome.
 */
export default async function RouteDrawerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = await getRouteDetail(id);
  if (!route) {
    notFound();
  }

  return (
    <Drawer title={route.title}>
      <RouteDetailView route={route} />
    </Drawer>
  );
}
