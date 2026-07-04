import { notFound } from "next/navigation";
import { EntryView } from "@/components/destination/entry";
import { SectionIntro } from "@/components/destination/section-intro";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/destination/fixtures";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Visa-free / visitor entry terms",
  "Passport & document rules",
  "Temporary protection (where it applies)",
  "What you can do on arrival",
  "First steps after you land",
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

  // Entry is read from the visitor's citizenship; where the pairing isn't
  // authored yet the view degrades to the scaffold so navigation never
  // dead-ends.
  if (!profile.entryDetail) {
    return (
      <SectionStub section={section} destinationName={profile.destination.name} planned={PLANNED} />
    );
  }

  return (
    <div className="space-y-10">
      <SectionIntro
        eyebrow={
          <>
            <span aria-hidden="true">{section.emoji}</span>
            {section.label}
          </>
        }
        title={`Getting into ${profile.destination.name}`}
        lead={profile.entryDetail.intro}
      />
      <EntryView entry={profile.entryDetail} />
    </div>
  );
}
