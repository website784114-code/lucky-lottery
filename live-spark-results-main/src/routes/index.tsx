import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GameCard } from "@/components/GameCard";
import { useLiveData } from "@/hooks/use-live-data";

function getIstNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60000);
}

function isActiveGamesWindow(now = getIstNow()) {
  const hour = now.getHours();
  const minute = now.getMinutes();
  return (
    hour > 10 && hour < 23 ||
    hour === 10 ||
    (hour === 23 && minute === 0)
  );
}

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { games, results, loading, date } = useLiveData();
  const latest = results[0];
  const activeGamesOpen = isActiveGamesWindow();

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Hero */}
      <section className="py-10 md:py-14 text-center fade-in">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Updated Every 30 Minutes
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
          Live Lottery Results
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Official winning numbers published throughout the day. Refreshed automatically.
        </p>
        <div className="mt-6"><CountdownTimer /></div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        {activeGamesOpen ? (
          <Stat label="Active Games" value={games.length} />
        ) : (
          <Stat label="Games Closed" />
        )}
        <Stat label="Today's Results" value={results.length} />
        <Stat label="Latest" value={latest ? String(latest.result_number).padStart(2, "0") : "—"} />
      </section>

      {/* Games */}
      <section className="pb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Results</h2>
          <span className="text-xs text-muted-foreground">{date} (IST)</span>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <div key={i} className="h-64 rounded-[10px] border border-border bg-card" />)}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            No games yet. Add some from the admin panel.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {games.map((g) => {
              const gameResults = results.filter((r) => r.game_id === g.id);
              const slots = g.time_slots.map((t) => ({
                time: t,
                number: gameResults.find((r) => r.result_time === t)?.result_number ?? null,
              }));
              const latestForGame = gameResults[0]?.result_time;
              return <GameCard key={g.id} name={g.name} slots={slots} latestTime={latestForGame} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: string | number; icon?: ReactNode }) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {value !== undefined ? (
        <div className="mt-1 text-2xl font-semibold font-mono">{value}</div>
      ) : null}
    </div>
  );
}
