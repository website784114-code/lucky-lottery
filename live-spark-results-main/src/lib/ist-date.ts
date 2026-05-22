// Returns today's date (YYYY-MM-DD) in Asia/Kolkata regardless of server/client TZ.
export function istToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

// Current IST time in minutes since 00:00.
export function istNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")!.value);
  const m = Number(parts.find((p) => p.type === "minute")!.value);
  return h * 60 + m;
}

// Parse "10:00 AM" / "1:30 PM" → minutes since 00:00. Returns -1 if invalid.
export function slotToMinutes(slot: string): number {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return -1;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

// True if a slot's time has arrived for the given date (IST).
// Past dates: always visible. Future dates: never. Today: only if slot <= now.
export function isSlotVisible(resultDate: string, slotTime: string): boolean {
  const today = istToday();
  if (resultDate < today) return true;
  if (resultDate > today) return false;
  return slotToMinutes(slotTime) <= istNowMinutes();
}
