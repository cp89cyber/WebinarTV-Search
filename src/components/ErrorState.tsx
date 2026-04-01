interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function ErrorState({ title, message, actionLabel, onAction }: ErrorStateProps) {
  return (
    <section className="state-card state-card--error" role="alert">
      <p className="state-card__eyebrow">Request problem</p>
      <h2>{title}</h2>
      <p>{message}</p>
      <button type="button" onClick={onAction}>
        {actionLabel}
      </button>
    </section>
  );
}
