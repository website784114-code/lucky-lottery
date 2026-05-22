import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const DEFAULT_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const totalMin = 10 * 60 + i * 30;
  const h24 = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
});

export const Route = createFileRoute("/admin/games")({ component: ManageGames });

function ManageGames() {
  const [games, setGames] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slots, setSlots] = useState(DEFAULT_SLOTS.join(", "));

  const load = async () => {
    const { data } = await supabase.from("games").select("*").order("name");
    setGames(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const time_slots = slots.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("games").insert({ name: name.trim(), time_slots });
    if (error) toast.error(error.message);
    else { toast.success("Game added"); setName(""); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this game and all its results?")) return;
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const rename = async (g: any) => {
    const next = prompt("New name:", g.name);
    if (!next) return;
    const { error } = await supabase.from("games").update({ name: next.trim() }).eq("id", g.id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); load(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold gold-text">Manage Games</h1>

      <form onSubmit={add} className="glass rounded-2xl p-6 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Game name (e.g. Royal Game)"
          className="w-full rounded-md bg-input border border-border px-3 py-2" />
        <textarea value={slots} onChange={(e) => setSlots(e.target.value)} rows={3}
          placeholder="Comma-separated time slots (e.g. 10:00 AM, 10:30 AM, …)"
          className="w-full rounded-md bg-input border border-border px-3 py-2 font-mono text-xs" />
        <button className="rounded-md bg-primary text-primary-foreground py-2 px-4 font-semibold gold-glow">Add Game</button>
      </form>

      <div className="space-y-2">
        {games.map((g) => (
          <div key={g.id} className="glass rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold gold-text">{g.name}</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{g.time_slots.length} slots · {g.time_slots.slice(0, 4).join(", ")}…</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => rename(g)} className="text-xs text-primary hover:underline">Rename</button>
              <button onClick={() => remove(g.id)} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
