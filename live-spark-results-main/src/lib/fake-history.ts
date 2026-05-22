// Deterministic fake historical lottery results.
// Used as a fallback so any past date (2024+) always shows realistic data
// even if the admin never published results for that day.

const FAKE_GAMES = ["Diamond Draw", "Golden Spin", "Royal Game"];

// 30-minute slots from 10:00 to 23:30.
function defaultSlots(): string[] {
  const out: string[] = [];
  for (let h = 10; h <= 23; h++) {
    for (const m of [0, 30]) {
      const hh = ((h + 11) % 12) + 1;
      const mm = m.toString().padStart(2, "0");
      const ap = h < 12 ? "AM" : "PM";
      out.push(`${hh}:${mm} ${ap}`);
    }
  }
  return out;
}

// xfnv1a-ish string hash → 32-bit int, then mulberry32 for stable RNG.
function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rand(seed: string): number {
  let t = hash(seed) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export interface FakeRow {
  id: string;
  result_date: string;
  result_time: string;
  result_number: number;
  games: { name: string };
}

export function generateFakeHistory(
  date: string,
  games?: Array<{ name: string; time_slots?: string[] }>,
): FakeRow[] {
  const list: Array<{ name: string; time_slots?: string[] }> =
    games && games.length ? games : FAKE_GAMES.map((n) => ({ name: n }));
  const rows: FakeRow[] = [];
  for (const g of list) {
    const slots = g.time_slots && g.time_slots.length ? g.time_slots : defaultSlots();

    for (const t of slots) {
      const n = Math.floor(rand(`${date}|${g.name}|${t}`) * 100) + 1;
      rows.push({
        id: `fake-${date}-${g.name}-${t}`,
        result_date: date,
        result_time: t,
        result_number: n,
        games: { name: g.name },
      });
    }
  }
  // Latest time first (string sort works for "h:mm AM/PM" only loosely, so sort by parsed minutes).
  rows.sort((a, b) => parseTime(b.result_time) - parseTime(a.result_time));
  return rows;
}

function parseTime(s: string): number {
  // Accept "10:00 AM" or "10:00".
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}
