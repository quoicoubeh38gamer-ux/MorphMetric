import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary, or the whole route opts out of
  // static rendering and the build warns.
  return (
    <Suspense fallback={<div className="container py-24" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
