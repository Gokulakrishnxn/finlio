const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatINR = (value: number) => inr.format(value);

export const formatSignedINR = (value: number) =>
  `${value >= 0 ? "+" : "−"}${inr.format(Math.abs(value))}`;

export const formatPct = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Today's date in India, as "YYYY-MM-DD".
export const todayIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
