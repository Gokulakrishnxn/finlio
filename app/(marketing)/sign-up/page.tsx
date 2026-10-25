import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your account · Finlio" };

export default function SignUpPage() {
  // The form reads ?next= and ?error=, so it renders in the browser.
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
