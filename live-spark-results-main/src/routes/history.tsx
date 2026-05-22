import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { istToday, isSlotVisible } from "@/lib/ist-date";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Result History — Live Lottery Result" },
      { name: "description", content: "Check today, yesterday and past lottery results. Pick any date." },
    ],
  }),
  component: History,
});

function toYMD(d: Date) {
  return format(d, "yyyy-MM-dd");
}
function fromYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function History() {
  const today = istToday();
  const yesterday = (() => {
    const d = fromYMD(today);
    d.setDate(d.getDate() - 1);
    return toYMD(d);
  })();

  const [date, setDate] = useState<string>(today);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      const [{ data: real }, { data: games }] = await Promise.all([
        supabase
          .from("results")
          .select("*, games(name)")
          .eq("result_date", date)
          .order("result_time", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase.from("games").select("name, time_slots"),
      ]);
      if (cancelled) return;
      // Hide future-slot results (admin may publish ahead of time).
      const realRows = (real ?? []).filter((r) => isSlotVisible(r.result_date, r.result_time));
      if (realRows.length === 0 && date < today) {
        const { generateFakeHistory } = await import("@/lib/fake-history");
        setRows(generateFakeHistory(date, games ?? undefined));
      } else {
        setRows(realRows);
      }
      setLoading(false);
    };
    run(true);
    // Auto-refresh today's view so pending slots reveal at slot time.
    const poll = date === today ? setInterval(() => run(false), 30_000) : null;
    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
  }, [date, today]);


  const selected = fromYMD(date);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold">Result History</h1>
        <p className="text-gray-600 mt-1 text-sm">Select any date to view past lottery results.</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            variant={date === today ? "default" : "outline"}
            size="sm"
            onClick={() => setDate(today)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400"
          >
            Today
          </Button>
          <Button
            variant={date === yesterday ? "default" : "outline"}
            size="sm"
            onClick={() => setDate(yesterday)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400"
          >
            Yesterday
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("ml-auto justify-start text-left font-normal gap-2 bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400")}
              >
                <CalendarIcon className="h-4 w-4" />
                {format(selected, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d) => d && setDate(toYMD(d))}
                disabled={(d) => toYMD(d) > today}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Game</th>
                <th className="text-right px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    <Search className="inline h-4 w-4 mr-2" />
                    No results found for this date.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{r.result_date}</td>
                    <td className="px-4 py-3 text-gray-600">{r.result_time}</td>
                    <td className="px-4 py-3">{r.games?.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-lg">
                      {String(r.result_number).padStart(2, "0")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          {rows.length} result{rows.length === 1 ? "" : "s"} • Latest time on top
        </p>
      </div>
    </div>
  );
}
