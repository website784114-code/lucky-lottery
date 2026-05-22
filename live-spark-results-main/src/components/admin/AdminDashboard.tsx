import { useEffect, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { istToday, isSlotVisible } from "@/lib/ist-date";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ResultRow {
  id: string;
  game_id: string;
  game_name: string;
  result_number: number;
  result_time: string;
  result_date: string;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [games, setGames] = useState<any[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [gameId, setGameId] = useState("");
  const [resultNumber, setResultNumber] = useState("");
  const [resultDate, setResultDate] = useState(istToday());
  const [resultTime, setResultTime] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [gamesRes, resultsRes] = await Promise.all([
      supabase.from("games").select("*").order("name"),
      supabase.from("results").select("*, games(name)").order("created_at", { ascending: false }).limit(50),
    ]);

    setGames(gamesRes.data ?? []);
    setResults(
      (resultsRes.data ?? []).map((row: any) => ({
        id: row.id,
        game_id: row.game_id,
        game_name: row.games?.name ?? "—",
        result_number: row.result_number,
        result_time: row.result_time,
        result_date: row.result_date,
      })),
    );
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!gameId && games.length > 0) {
      setGameId(games[0].id);
    }
  }, [games, gameId]);

  const selectedGame = games.find((g) => g.id === gameId);
  const timeSlots = selectedGame?.time_slots ?? [];

  const publishResult = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (!gameId) return toast.error("Select a game.");
    if (!resultNumber || Number(resultNumber) < 1 || Number(resultNumber) > 100) return toast.error("Enter a number between 1 and 100.");
    if (!resultTime) return toast.error("Select a time slot.");
    if (!resultDate) return toast.error("Select a date.");

    const numberValue = Number(resultNumber);
    setBusy(true);

    const { data: existing, error: queryError } = await supabase
      .from("results")
      .select("id")
      .eq("game_id", gameId)
      .eq("result_date", resultDate)
      .eq("result_time", resultTime)
      .maybeSingle();

    if (queryError) {
      setBusy(false);
      return toast.error(queryError.message);
    }

    if (existing) {
      setBusy(false);
      return toast.error("A result already exists for that game, date and time.");
    }

    const { error } = await supabase.from("results").insert([{ 
      game_id: gameId,
      result_number: numberValue,
      result_time: resultTime,
      result_date: resultDate,
    }]);

    setBusy(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Result published successfully.");
      setResultNumber("");
      setResultTime("");
      setResultDate(istToday());
      load();
    }
  };

  const removeResult = async (id: string) => {
    if (!confirm("Delete this result?")) return;
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Result deleted.");
      load();
    }
  };

  const editResult = async (row: ResultRow) => {
    const next = prompt(`New number for ${row.game_name} @ ${row.result_time} on ${row.result_date} (1–100):`, String(row.result_number));
    if (!next) return;
    const parsed = Number(next);
    if (!parsed || parsed < 1 || parsed > 100) return toast.error("Number must be between 1 and 100.");

    const { error } = await supabase.from("results").update({ result_number: parsed }).eq("id", row.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Result updated.");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gold-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">Publish and manage lottery results with the hidden admin workflow.</p>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40"
        >
          Logout
        </button>
      </div>

      <form onSubmit={publishResult} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Publish Result</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Game Name</label>
            <select
              value={gameId}
              onChange={(event) => setGameId(event.target.value)}
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            >
              <option value="">Select a game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Result Number</label>
            <input
              value={resultNumber}
              onChange={(event) => setResultNumber(event.target.value)}
              type="number"
              min={1}
              max={100}
              placeholder="1–100"
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Date</label>
            <input
              value={resultDate}
              onChange={(event) => setResultDate(event.target.value)}
              type="date"
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Time Slot</label>
            <select
              value={resultTime}
              onChange={(event) => setResultTime(event.target.value)}
              className="mt-2 w-full rounded-md bg-input border border-border px-3 py-2"
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot: string) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary text-primary-foreground py-2 font-semibold gold-glow disabled:opacity-60"
        >
          {busy ? "Publishing…" : "Publish Result"}
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
                results.map((row) => {
                  const status = isSlotVisible(row.result_date, row.result_time) ? "Declared" : "Pending";
                  return (
                    <tr key={row.id} className="border-t border-border/30">
                      <td className="px-4 py-2 text-muted-foreground">{row.result_date}</td>
                      <td className="px-4 py-2 text-foreground">{row.game_name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{row.result_time}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold gold-text">{String(row.result_number).padStart(2, "0")}</td>
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
                        <button onClick={() => editResult(row)} className="text-xs text-primary hover:underline mr-3">Edit</button>
                        <button onClick={() => removeResult(row.id)} className="text-xs text-destructive hover:underline">
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
