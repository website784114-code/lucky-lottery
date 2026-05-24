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

  // Fixed 3 games - use database games if available, otherwise use defaults
  const fixedGames = games.length > 0 ? games : [
    { name: "Diamond Draw", id: "diamond-draw" },
    { name: "Golden Spin", id: "golden-spin" },
    { name: "Lucky Spin", id: "lucky-spin" },
  ];

  // Generate time slots from 10:00 AM to 11:00 PM every 30 minutes
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    let hour = 10;
    let minute = 0;
    while (hour < 23 || (hour === 23 && minute === 0)) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayMinute = minute === 0 ? "00" : minute;
      slots.push(`${displayHour}:${displayMinute} ${ampm}`);
      minute += 30;
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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
        <div className="mt-6">
          <a
            href="/app-debug.apk"
            download
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Download Android App
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        {activeGamesOpen ? (
          <Stat label="Active Games" value={fixedGames.length} />
        ) : (
          <Stat label="Games Closed" />
        )}
        <Stat label="Today's Results" value={results.length} />
        <Stat label="Total Slots" value={timeSlots.length} />
      </section>

      {/* Games - Always render 3 fixed horizontal rows */}
      <section className="pb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Results</h2>
          <span className="text-xs text-muted-foreground">{date} (IST)</span>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <div key={i} className="h-64 rounded-[10px] border border-border bg-card" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {fixedGames.map((game) => {
              const gameResults = results.filter((r) => r.game_id === game.id);
              const slots = timeSlots.map((t) => ({
                time: t,
                number: gameResults.find((r) => r.result_time === t)?.result_number ?? null,
              }));
              const latestForGame = gameResults[0]?.result_time;
              return <GameCard key={game.id} name={game.name} slots={slots} latestTime={latestForGame} resultDate={date} />;
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
