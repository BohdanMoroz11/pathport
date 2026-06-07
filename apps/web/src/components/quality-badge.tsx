import type { QualityLabel, QualityTone } from "@/lib/quality";

/** Token-driven tones so badges read correctly in both themes. */
const TONE_CLASSES: Record<QualityTone, string> = {
  demo: "bg-(--violet-soft) text-(--violet)",
  review: "bg-(--warn-soft) text-(--warn)",
  outdated: "bg-(--danger-soft) text-(--danger)",
  estimate: "bg-(--neutral-soft) text-(--neutral)",
  official: "bg-(--pos-soft) text-(--pos)",
  community: "bg-(--violet-soft) text-(--violet)",
  ai: "bg-(--brand-soft) text-(--brand)",
};

export function QualityBadge({ label }: { label: QualityLabel }) {
  return (
    <span
      title={label.description}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[label.tone]}`}
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
