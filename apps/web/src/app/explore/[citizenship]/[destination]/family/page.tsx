import { notFound } from "next/navigation";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/destination/fixtures";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Partner / spouse and their work rights",
  "Children & schooling ties",
  "Dependent parents",
  "Pet import: microchip & vaccinations",
  "Pet import: quarantine rules",
  "Pet import: banned or restricted breeds",
];

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("family");
  if (!profile || !section) {
    notFound();
  }

  return (
    <SectionStub section={section} destinationName={profile.destination.name} planned={PLANNED} />
  );
}
