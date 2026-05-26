import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between gap-6">
        <span className="text-sm font-semibold tracking-wide text-[var(--accent)]">Pathport</span>
        <Button type="button">Explore</Button>
      </header>

      <section className="flex flex-1 flex-col justify-center py-20">
        <p className="mb-4 text-sm font-medium text-[var(--muted)]">
          Immigration options, structured and source-aware.
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-[var(--foreground)]">
          Compare realistic migration paths without digging through scattered articles.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Pathport is being built as a clean, source-aware explorer for visas, residence routes,
          timelines, costs, and caveats.
        </p>
      </section>
    </main>
  );
}
