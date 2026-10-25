import { type NextRequest } from "next/server";
import { searchEquities } from "@/lib/instruments";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  try {
    return Response.json({ results: await searchEquities(q) });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Couldn't load the NSE stock list. Try again." },
      { status: 502 },
    );
  }
}
