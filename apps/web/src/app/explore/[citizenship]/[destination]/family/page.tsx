import { notFound } from "next/navigation";
import { FamilyView } from "@/components/destination/family";
import { SectionIntro } from "@/components/destination/section-intro";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/destination/fixtures";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Who you can bring (spouse, children, parents)",
  "Family reunification conditions & timelines",
  "Work rights & healthcare for family members",
  "Child benefit, schooling & parental leave",
  "Bringing pets — microchip, rabies, paperwork",
  "Quarantine rules & restricted breeds",
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

  // Family facts are authored per destination; where they are missing the view
  // degrades to the scaffold so navigation never dead-ends.
  if (!profile.family) {
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
        title={`Family & pets in ${profile.destination.name}`}
        lead={profile.family.intro}
      />
      <FamilyView family={profile.family} />
    </div>
  );
}
