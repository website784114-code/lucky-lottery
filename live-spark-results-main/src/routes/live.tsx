import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useLiveData } from "@/hooks/use-live-data";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Results — Live Lottery Result" },
      { name: "description", content: "Watch live lottery results update in real time." },
    ],
  }),
  component: Live,
});

function Live() {
  const { games, results } = useLiveData();

  // Latest result per game (results already sorted by newest first)
  const latestByGame = games
    .map((g) => {
      const latest = results.find((r) => r.game_id === g.id);
      return { game: g, result: latest };
    })
    .filter((x) => x.result);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5">
          <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Live Feed</span>
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">Latest Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time updates across all games</p>
      </div>

      {/* Latest Result Cards */}
      <section className="mb-8">
        {latestByGame.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-card p-8 text-center text-muted-foreground text-sm fade-in">
            Waiting for first results of the day…
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {latestByGame.map(({ game, result }, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="rounded-[10px] border border-border bg-card p-5 flex flex-col items-center text-center transition-colors hover:border-primary/40"
              >
                <span className="text-xs uppercase tracking-wider text-primary font-medium">
                  {game.name}
                </span>
                <div className="mt-3 text-3xl font-mono font-bold text-foreground">
                  {String(result!.result_number).padStart(2, "0")}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {result!.result_time} · {result!.result_date}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Countdown */}
      <div className="flex justify-center mb-8">
        <CountdownTimer />
      </div>

      {/* Recent Results List */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Results</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, 12).map((r, i) => {
            const g = games.find((x) => x.id === r.game_id);
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="rounded-[10px] border border-border bg-card p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-muted-foreground">{g?.name}</div>
                  <div className="text-xs text-muted-foreground">{r.result_time}</div>
                </div>
                <div className="text-xl font-mono font-semibold text-foreground">
                  {String(r.result_number).padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
