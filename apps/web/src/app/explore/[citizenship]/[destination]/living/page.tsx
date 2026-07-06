import { notFound } from "next/navigation";
import { LivingView } from "@/components/destination/living";
import { SectionIntro } from "@/components/destination/section-intro";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/api";
import { destinationBasePath, sectionBySlug, sectionHref } from "@/lib/destination/sections";

const PLANNED = [
  "Rent by city (centre vs outer, family-size)",
  "Groceries & eating out",
  "Transport, utilities & internet",
  "Income tax & social contributions",
  "Healthcare system & access for migrants",
  "Schooling & childcare for kids",
  "Lifestyle (gym, leisure)",
  "A single / couple / family monthly budget",
];

export default async function LivingPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = await getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("living");
  if (!profile || !section) {
    notFound();
  }

  // Cost-of-living facts are authored per destination; where they are missing
  // the view degrades to the scaffold so navigation never dead-ends.
  if (!profile.living) {
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
        title={`Living in ${profile.destination.name}`}
        lead={profile.living.intro}
      />
      <LivingView
        living={profile.living}
        takeHome={profile.work?.incomeTax.takeHome}
        workHref={sectionHref(
          destinationBasePath(profile.citizenship.code, profile.destination.code),
          "work",
        )}
      />
    </div>
  );
}
