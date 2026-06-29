import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * The original centered header/footer chrome, kept for the placeholder browse
 * screens (home, citizenship list, route detail, 404) until they are rebuilt in
 * S5. The destination shell (S3) provides its own app-shell layout instead, so
 * this chrome lives in the pages that still want it rather than the root layout.
 */
export function BrowseChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
