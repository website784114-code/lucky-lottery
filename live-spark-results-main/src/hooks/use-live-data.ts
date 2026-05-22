import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { istToday, isSlotVisible } from "@/lib/ist-date";

export interface Game { id: string; name: string; time_slots: string[]; }
export interface Result { id: string; game_id: string; result_number: number; result_time: string; result_date: string; created_at: string; }

export function useLiveData(date?: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState<string>(date ?? istToday());

  const load = useCallback(async () => {
    const d = date ?? istToday();
    setActiveDate(d);
    const [g, r] = await Promise.all([
      supabase.from("games").select("*").order("name"),
      supabase
        .from("results")
        .select("*")
        .eq("result_date", d)
        .order("result_time", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);
    setGames(g.data ?? []);
    // Hide results whose slot time hasn't arrived yet (IST). Admin can publish
    // ahead, but users only see them once the slot time hits.
    const visible = (r.data ?? []).filter((row) => isSlotVisible(row.result_date, row.result_time));
    setResults(visible);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    load();
    const ch = supabase.channel("live-results")
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, () => load())
      .subscribe();
    // Backup poll every 30s (handles missed realtime events + IST day rollover).
    const poll = setInterval(load, 30_000);
    return () => { supabase.removeChannel(ch); clearInterval(poll); };
  }, [load]);

  return { games, results, loading, reload: load, date: activeDate };
}
