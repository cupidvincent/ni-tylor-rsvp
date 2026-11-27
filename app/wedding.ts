const localDate = "2027-01-27";
const startsAt = `${localDate}T08:00:00+08:00`;
const timeZone = "Asia/Manila";
const weddingDate = new Date(`${localDate}T00:00:00+08:00`);
const day = 24 * 60 * 60 * 1000;
const deadline = new Date(weddingDate.getTime() - 20 * day);
const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone,
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const wedding = {
  couple: "Nña & Tylor",
  date: dateFormat.format(weddingDate),
  startsAt,
  time: new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startsAt)),
  venue: "Hotel Sogo",
  weekday: new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
  }).format(weddingDate),
  deadline: dateFormat.format(deadline),
  closesAt: deadline.getTime() + day,
};

export function rsvpIsClosed() {
  return Date.now() >= wedding.closesAt;
}
