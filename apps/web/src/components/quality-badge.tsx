import type { QualityLabel, QualityTone } from "@/lib/quality";

const TONE_CLASSES: Record<QualityTone, string> = {
  demo: "border-(--border) bg-(--background) text-(--muted)",
  review: "border-amber-200 bg-amber-50 text-amber-800",
  outdated: "border-red-200 bg-red-50 text-red-700",
  estimate: "border-sky-200 bg-sky-50 text-sky-700",
  official: "border-teal-200 bg-teal-50 text-teal-800",
  community: "border-violet-200 bg-violet-50 text-violet-700",
  ai: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function QualityBadge({ label }: { label: QualityLabel }) {
  return (
    <span
      title={label.description}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[label.tone]}`}
    >
      {label.label}
    </span>
  );
}

export function QualityBadges({ labels }: { labels: QualityLabel[] }) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Content quality">
      {labels.map((label) => (
        <li key={label.label}>
          <QualityBadge label={label} />
        </li>
      ))}
    </ul>
  );
}
