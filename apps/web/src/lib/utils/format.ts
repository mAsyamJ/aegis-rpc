export function shortAddress(addr: string, head = 6, tail = 4): string {
  if (!addr || addr.length < head + tail + 2) return addr;
  return `${addr.slice(0, head + 2)}…${addr.slice(-tail)}`;
}

export function formatMs(ms?: number): string {
  if (ms === undefined) return "—";
  return `${ms} ms`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}
