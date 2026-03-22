export function ProgressBar({value, label}: {value: number; label: string}) {
  return (
    <div aria-label={label} className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{width: `${value}%`}} />
      </div>
      <p className="text-xs uppercase tracking-[0.25em] text-muted">{Math.round(value)}%</p>
    </div>
  );
}
