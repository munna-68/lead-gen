export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center border border-dashed border-ink-4 bg-ink-1 px-6 py-20 text-center">
      <div className="mb-3 font-mono text-2xs uppercase tracking-extra-wide text-fog-4">
        // empty
      </div>
      <h3 className="font-display text-2xl italic tracking-tightest text-fog-1">
        {title}
      </h3>
      <p className="mt-2 max-w-md font-sans text-sm text-fog-3">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
