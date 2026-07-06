import { notFound } from "next/navigation";
import { SectionIntro } from "@/components/destination/section-intro";
import { SectionStub } from "@/components/destination/section-stub";
import { WorkView } from "@/components/destination/work";
import { getDestinationProfile } from "@/lib/api";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Ways to earn (employee → freelancer → business owner)",
  "Income tax & effective burden by earning mode",
  "Accounting, VAT & registration obligations",
  "Right to work by status",
  "Finding work (channels, application norms)",
  "Getting set up as self-employed",
  "Recognising foreign qualifications",
  "What's in demand vs. saturated",
];

export default async function WorkPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = await getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("work");
  if (!profile || !section) {
    notFound();
  }

  // Work facts are authored per destination; where they are missing the view
  // degrades to the scaffold so navigation never dead-ends.
  if (!profile.work) {
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
        title={`Working in ${profile.destination.name}`}
        lead={profile.work.intro}
      />
      <WorkView work={profile.work} />
    </div>
  );
}
