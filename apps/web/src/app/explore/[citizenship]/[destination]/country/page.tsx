import { notFound } from "next/navigation";
import { CountryView } from "@/components/destination/country";
import { SectionIntro } from "@/components/destination/section-intro";
import { SectionStub } from "@/components/destination/section-stub";
import { getDestinationProfile } from "@/lib/destination/fixtures";
import { sectionBySlug } from "@/lib/destination/sections";

const PLANNED = [
  "Where it is (location + map)",
  "Population & demographics",
  "Languages (and how far English gets you)",
  "Economy & job market",
  "Political system & stability",
  "Safety",
  "Climate",
  "Culture & social norms",
  "Religion",
  "Climate for LGBTQ+ and minorities",
];

export default async function CountryPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = getDestinationProfile(citizenship, destination);
  const section = sectionBySlug("country");
  if (!profile || !section) {
    notFound();
  }

  // Country facts are authored per destination; where they are missing the view
  // degrades to the scaffold so navigation never dead-ends.
  if (!profile.country) {
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
        title={profile.destination.name}
      />
      <CountryView country={profile.country} />
    </div>
  );
}
