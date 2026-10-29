import { Suspense } from "react";
import AuthForm from "./AuthForm";

export const metadata = { title: "Log in — Stayfield" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
