import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/onboarding";

export const metadata: Metadata = { title: "Set up your space · Finlio" };

export default function SetupPage() {
  return <Onboarding />;
}
