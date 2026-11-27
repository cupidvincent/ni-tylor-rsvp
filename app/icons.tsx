type IconName = "heart" | "calendar" | "search" | "check" | "mail" | "pin";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "heart" && <path d="M20.8 8.8a4.5 4.5 0 0 0-7.7-3.2L12 6.7l-1.1-1.1a4.5 4.5 0 1 0-6.4 6.4L12 19.5l7.5-7.5a4.5 4.5 0 0 0 1.3-3.2Z" />}
      {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>}
      {name === "search" && <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.5 4.5" /></>}
      {name === "check" && <path d="m5 12 4 4L19 6" />}
      {name === "mail" && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>}
      {name === "pin" && <><path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.25" /></>}
    </svg>
  );
}
