import { notFound } from "next/navigation";
import { RoutesComparison } from "@/components/destination/routes-comparison";
import { SectionIntro } from "@/components/destination/section-intro";
import { getDestinationProfile, getRoutes } from "@/lib/api";
import { destinationBasePath, sectionBySlug } from "@/lib/destination/sections";

export default async function RoutesSectionPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = await getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("routes");
  if (!profile || !section) {
    notFound();
  }

  // Routes are the one section backed by the real API (@pathport/contracts),
  // not an in-repo fixture — the route model already exists end-to-end. A null
  // or empty result degrades to a calm empty state so the shell never dead-ends.
  const routes = await getRoutes(citizenship, destination);
  const basePath = destinationBasePath(citizenship, destination);

  return (
    <div className="space-y-10">
      <SectionIntro
        eyebrow={
          <>
            <span aria-hidden="true">{section.emoji}</span>
            {section.label}
          </>
        }
        title={`Routes into ${profile.destination.name}`}
        lead={`Every long-term way to settle in ${profile.destination.name}, compared on the same cost and timeline scales. Open one to see its requirements, documents, and sources.`}
      />

      {routes && routes.length > 0 ? (
        <RoutesComparison routes={routes} basePath={basePath} />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-(--border-strong) bg-(--surface) p-6">
          <p className="text-sm font-medium text-(--text)">No routes recorded yet.</p>
          <p className="mt-1 text-sm text-(--text-2)">
            We don&apos;t have long-term routes catalogued for this pairing yet. Check back as the
            data set grows.
          </p>
        </div>
      )}
    </div>
  );
}
