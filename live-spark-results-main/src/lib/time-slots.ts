export function generateHalfHourTimeSlots(startHour = 10, endHour = 23) {
  const slots: string[] = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
    const hour24 = Math.floor(minutes / 60);
    const minutePart = minutes % 60;
    const period = hour24 < 12 ? "AM" : "PM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const formattedMinutes = String(minutePart).padStart(2, "0");
    slots.push(`${hour12}:${formattedMinutes} ${period}`);
  }

  return slots;
}
