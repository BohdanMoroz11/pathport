import { notFound } from "next/navigation";
import { DestinationRail } from "@/components/destination/destination-rail";
import { getDestinationProfile } from "@/lib/destination/fixtures";

/**
 * The destination app-shell (Phase 2 / S3): a persistent left rail + a centered
 * content canvas. Each section under this route is its own screen rendered into
 * the canvas. Built FE-first against the in-repo fixture; see
 * docs/design-direction.md and docs/plans/phase-2.md.
 */
export default async function DestinationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = getDestinationProfile(citizenship, destination);
  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-(--rail-border) lg:fixed lg:inset-y-0 lg:left-0 lg:w-[264px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <DestinationRail citizenship={profile.citizenship} destination={profile.destination} />
      </aside>
      <div className="w-full lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[var(--content-max)] px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
