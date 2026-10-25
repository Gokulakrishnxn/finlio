import { disconnectGmail } from "@/lib/google-session";

// DELETE stops Gmail reading; the person stays signed in.
export async function DELETE() {
  await disconnectGmail();
  return Response.json({ gmail: false });
}
