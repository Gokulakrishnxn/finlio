import { signOut } from "@/lib/google-session";

export async function POST() {
  await signOut();
  return Response.json({ signedIn: false });
}
