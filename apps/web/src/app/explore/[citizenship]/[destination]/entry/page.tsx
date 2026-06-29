import { notFound } from "next/navigation";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/destination/fixtures";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Visa-free / visitor entry terms",
  "Passport & document rules",
  "Temporary protection (where it applies)",
  "What you can do on arrival",
];

export default async function EntryPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("entry");
  if (!profile || !section) {
    notFound();
  }

  return (
    <SectionStub section={section} destinationName={profile.destination.name} planned={PLANNED} />
  );
}
