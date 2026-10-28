import type { Metadata } from "next";
import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Đăng ký", robots: { index: false } };

export default function SignUpPage() {
  return <AuthForm mode="sign-up" action={signUp} />;
}
