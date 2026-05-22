import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { istToday, isSlotVisible } from "@/lib/ist-date";
import { generateHalfHourTimeSlots } from "@/lib/time-slots";

const initialEntries = [
  { gameId: "", resultNumber: "" },
  { gameId: "", resultNumber: "" },
  { gameId: "", resultNumber: "" },
];

export function ManageResults() {
  const [games, setGames] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [entries, setEntries] = useState(initialEntries);
  const [resultDate, setResultDate] = useState(istToday());
  const [resultTime, setResultTime] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [g, r] = await Promise.all([
      supabase.from("games").select("*").order("name"),
      supabase.from("results").select("*, games(name)").order("created_at", { ascending: false }).limit(50),
    ]);

    setGames(g.data ?? []);
    setResults(r.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const timeSlots = generateHalfHourTimeSlots(10, 23);

  const updateEntry = (index: number, changes: Partial<{ gameId: string; resultNumber: string }>) => {
    setEntries((prev) => prev.map((entry, idx) => (idx === index ? { ...entry, ...changes } : entry)));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!resultDate) return toast.error("Select a date.");
    if (!resultTime) return toast.error("Select a time slot.");

    const filledEntries = entries.map((entry) => ({
      gameId: entry.gameId,
      resultNumber: entry.resultNumber.trim(),
    }));

    const missingEntry = filledEntries.find((entry) => !entry.gameId || !entry.resultNumber);
    if (missingEntry) {
      return toast.error("Fill all three game rows.");
    }

    const resultsToInsert = filledEntries.map((entry) => ({
      game_id: entry.gameId,
      result_number: Number(entry.resultNumber),
      result_date: resultDate,
      result_time: resultTime,
    }));

    if (resultsToInsert.some((item) => Number.isNaN(item.result_number) || item.result_number < 1 || item.result_number > 100)) {
      return toast.error("Enter a valid result number between 1 and 100 for each game.");
    }

    const gameIds = resultsToInsert.map((item) => item.game_id);
    const uniqueGameIds = Array.from(new Set(gameIds));
    if (uniqueGameIds.length !== 3) {
      return toast.error("Choose three different games.");
    }

    setBusy(true);

    const { data: existing, error: fetchError } = await supabase
      .from("results")
      .select("id, game_id")
      .in("game_id", uniqueGameIds)
      .eq("result_date", resultDate)
      .eq("result_time", resultTime);

    if (fetchError) {
      setBusy(false);
      return toast.error(fetchError.message);
    }

    if (existing && existing.length > 0) {
      const existingNames = existing
        .map((item) => games.find((game) => game.id === item.game_id)?.name ?? "Game")
        .join(", ");
      setBusy(false);
      return toast.error(`Results already exist for ${existingNames} at this date and time.`);
    }

    const { error } = await supabase.from("results").insert(resultsToInsert);
    setBusy(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Results published successfully.");
      setEntries(initialEntries);
      setResultTime("");
      setResultDate(istToday());
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this result?")) return;
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Deleted");
      load();
    }
  };

  const edit = async (r: any) => {
    const next = prompt(`New number for ${r.games?.name} @ ${r.result_time} on ${r.result_date} (1–100):`, String(r.result_number));
    if (!next) return;
    const n = Number(next);
    if (!n || n < 1 || n > 100) return toast.error("Number must be between 1 and 100.");

    const { error } = await supabase.from("results").update({ result_number: n }).eq("id", r.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Updated");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold gold-text">Add Result</h1>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Latest Results</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {results.slice(0, 3).map((result) => (
            <div key={result.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-sm uppercase tracking-wider text-muted-foreground">{result.games?.name}</p>
              <p className="mt-2 text-2xl font-bold gold-text">{String(result.result_number).padStart(2, "0")}</p>
            </div>
          ))}
          {results.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground">
              No published results yet.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Date</label>
            <input
              type="date"
              value={resultDate}
              onChange={(e) => setResultDate(e.target.value)}
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Time Slot</label>
            <select
              value={resultTime}
              onChange={(e) => setResultTime(e.target.value)}
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot: string) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Game {index + 1}</label>
              <select
                value={entry.gameId}
                onChange={(e) => updateEntry(index, { gameId: e.target.value })}
                className="w-full rounded-md bg-input border border-border px-3 py-2"
              >
                <option value="">Select a game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
              <input
                value={entry.resultNumber}
                onChange={(e) => updateEntry(index, { resultNumber: e.target.value })}
                type="number"
                min={1}
                max={100}
                placeholder="1–100"
                className="w-full rounded-md bg-input border border-border px-3 py-2"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary text-primary-foreground py-2 font-semibold gold-glow disabled:opacity-60"
        >
          {busy ? "Publishing…" : "Publish Results"}
        </button>
      </form>

      <div className="glass rounded-2xl overflow-hidden">
        <h2 className="px-4 py-3 text-sm uppercase tracking-wider text-muted-foreground border-b border-border/30">Recent Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Game</th>
                <th className="text-left px-4 py-2">Time</th>
                <th className="text-right px-4 py-2">Number</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No results yet</td>
                </tr>
              ) : (
                results.map((r) => {
                  const status = isSlotVisible(r.result_date, r.result_time) ? "Declared" : "Pending";
                  return (
                    <tr key={r.id} className="border-t border-border/30">
                      <td className="px-4 py-2 text-muted-foreground">{r.result_date}</td>
                      <td className="px-4 py-2 text-foreground">{r.games?.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.result_time}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold gold-text">{String(r.result_number).padStart(2, "0")}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-xs font-medium border ${
                            status === "Declared"
                              ? "border-green-500/40 bg-green-500/10 text-green-400"
                              : "border-orange-500/40 bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => edit(r)} className="text-xs text-primary hover:underline mr-3">Edit</button>
                        <button onClick={() => remove(r.id)} className="text-xs text-destructive hover:underline">
                          <Trash2 className="inline h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
