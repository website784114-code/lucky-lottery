import { useEffect, useState } from "react";

function nextSlot(now: Date) {
  const next = new Date(now);
  const m = now.getMinutes();
  if (m < 30) next.setMinutes(30, 0, 0);
  else next.setHours(now.getHours() + 1, 0, 0, 0);
  return next;
}

export function startCountdown(now = new Date()) {
  const startTime = new Date(now);
  startTime.setHours(10, 0, 0, 0);

  const lastResultTime = new Date(now);
  lastResultTime.setHours(23, 0, 0, 0);

  const resultsClosedAt = new Date(now);
  resultsClosedAt.setHours(23, 1, 0, 0);

  if (now < startTime || now >= resultsClosedAt) {
    return {
      closed: true,
      remainingMs: 0,
    };
  }

  const target = nextSlot(now);
  if (target.getTime() > lastResultTime.getTime()) {
    target.setTime(lastResultTime.getTime());
  }

  return {
    closed: false,
    remainingMs: Math.max(0, target.getTime() - now.getTime()),
  };
}

export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(startCountdown(new Date()));

  useEffect(() => {
    setMounted(true);
    setCountdown(startCountdown(new Date()));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const next = startCountdown(new Date());
      setCountdown(next);

      const closingTime = new Date();
      closingTime.setHours(23, 1, 0, 0);
      if (next.closed && Date.now() >= closingTime.getTime()) {
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex flex-col items-center rounded-[10px] border border-border bg-card px-6 py-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Next result in</span>
        <div className="mt-1 flex items-center gap-1 font-mono text-3xl font-semibold text-foreground">
          <span>--</span><span className="text-muted-foreground">:</span><span>--</span>
        </div>
      </div>
    );
  }

  if (countdown.closed) {
    return (
      <div className="inline-flex flex-col items-center rounded-[10px] border border-border bg-card px-6 py-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Results Closed</span>
        <div className="mt-1 flex items-center gap-1 font-mono text-3xl font-semibold text-foreground">
          <span>--</span><span className="text-muted-foreground">:</span><span>--</span>
        </div>
      </div>
    );
  }

  const totalSeconds = Math.max(0, Math.floor(countdown.remainingMs / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="inline-flex flex-col items-center rounded-[10px] border border-border bg-card px-6 py-4">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">Next result in</span>
      <div className="mt-1 flex items-center gap-1 font-mono text-3xl font-semibold text-foreground">
        <span>{minutes}</span><span className="text-muted-foreground">:</span><span>{seconds}</span>
      </div>
    </div>
  );
}
