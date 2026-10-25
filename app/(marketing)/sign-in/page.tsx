import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in · Finlio" };

export default function SignInPage() {
  // The form reads ?next= and ?error=, so it renders in the browser.
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
