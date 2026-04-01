interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section className="state-card" aria-live="polite">
      <p className="state-card__eyebrow">No matches</p>
      <h2>{title}</h2>
      <p>{message}</p>
      <button type="button" onClick={onAction}>
        {actionLabel}
      </button>
    </section>
  );
}
