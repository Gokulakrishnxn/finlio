import { type NextRequest } from "next/server";
import { isAllowedLogoDomain } from "@/lib/brands";

// Company logos, fetched by Finlio's server so the browser never calls a logo
// service directly. Only known brand domains are served (not an open proxy).

type Logo = { body: ArrayBuffer; type: string; size: number };

const MIN_SIZE = 32; // smaller icons look blurry; the app shows its own badge instead
const cache = new Map<string, Logo | null>();

// Width of a PNG or ICO image in pixels; 0 if unknown. SVGs are refused elsewhere.
function imageWidth(buf: ArrayBuffer, type: string) {
  const b = new Uint8Array(buf);
  if (type.includes("png") && b.length > 24) return (b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19];
  if ((type.includes("icon") || type.includes("ico")) && b.length > 6) return b[6] || 256;
  if (type.includes("jpeg") || type.includes("webp")) return MIN_SIZE; // accepted as-is
  return 0;
}

async function fetchLogo(url: string): Promise<Logo | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/") || type.includes("svg")) return null;
    // icon.horse serves a generic letter image when a site has no icon; it marks
    // those with a 5-minute shared cache (real icons get a day).
    if (url.includes("icon.horse") && /s-maxage=300\b/.test(res.headers.get("cache-control") ?? "")) return null;
    const body = await res.arrayBuffer();
    return { body, type, size: imageWidth(body, type) };
  } catch {
    return null;
  }
}

async function bestLogo(domain: string): Promise<Logo | null> {
  if (cache.has(domain)) return cache.get(domain)!;
  const candidates = await Promise.all([
    fetchLogo(`https://icon.horse/icon/${domain}`),
    fetchLogo(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`),
  ]);
  const best = candidates
    .filter((c): c is Logo => c !== null && c.size >= MIN_SIZE)
    .sort((a, b) => b.size - a.size)[0] ?? null;
  // Remember "too small" answers, but retry later if both services failed outright.
  if (best || candidates.some((c) => c !== null)) cache.set(domain, best);
  return best;
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("d")?.toLowerCase() ?? "";
  if (!isAllowedLogoDomain(domain)) return new Response(null, { status: 404 });
  const logo = await bestLogo(domain);
  if (!logo) return new Response(null, { status: 404 });
  return new Response(logo.body, {
    headers: {
      "Content-Type": logo.type,
      "Cache-Control": "public, max-age=604800, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
