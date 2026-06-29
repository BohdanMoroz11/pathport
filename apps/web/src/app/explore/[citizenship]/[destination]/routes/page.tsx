import { notFound } from "next/navigation";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/destination/fixtures";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Shared-scale cost & timeline comparison bars",
  "Work-rights, family, and path-to-PR signals",
  "Sort by recommended / cheapest / fastest / PR",
  "Per-route detail in a drawer (own URL)",
  "Requirements, documents, and process steps",
  "Sources inline on each route",
];

export default async function RoutesSectionPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("routes");
  if (!profile || !section) {
    notFound();
  }

  return (
    <SectionStub section={section} destinationName={profile.destination.name} planned={PLANNED} />
  );
}
