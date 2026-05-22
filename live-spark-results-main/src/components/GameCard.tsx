export interface SlotResult {
  time: string;
  number: number | null;
  isLatest?: boolean;
}

export function GameCard({ name, slots, latestTime }: { name: string; slots: SlotResult[]; latestTime?: string }) {
  return (
    <div className="fade-in rounded-[10px] border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">{name}</h3>
        <span className="text-xs text-muted-foreground">{slots.length} slots</span>
      </div>
      <div className="divide-y divide-border">
        <div className="grid grid-cols-3 px-1 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Time</span>
          <span className="text-center">Result</span>
          <span className="text-right">Status</span>
        </div>
        {slots.map((s) => {
          const isLatest = s.time === latestTime && s.number != null;
          const declared = s.number != null;
          return (
            <div
              key={s.time}
              className={`grid grid-cols-3 items-center px-1 py-2.5 text-sm ${
                isLatest ? "rounded-md border border-primary/60 bg-primary/5 my-1 px-2" : ""
              }`}
            >
              <span className="text-muted-foreground">{s.time}</span>
              <span className={`text-center font-mono font-semibold ${declared ? "text-foreground" : "text-muted-foreground"}`}>
                {declared ? String(s.number).padStart(2, "0") : "—"}
              </span>
              <span className={`text-right text-xs ${declared ? "text-primary" : "text-muted-foreground"}`}>
                {declared ? "Declared" : "Waiting"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
