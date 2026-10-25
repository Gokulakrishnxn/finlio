import { todayLocal } from "@/lib/format";
import type { StoreData } from "@/lib/store";

// Downloads everything in this browser as one JSON file, restorable from the
// welcome screen or Settings → Data controls.
export function downloadBackup(data: StoreData) {
  const blob = new Blob([JSON.stringify({ app: "finlio", version: 1, data }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finlio-backup-${todayLocal()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
