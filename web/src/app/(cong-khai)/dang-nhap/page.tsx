import type { Metadata } from "next";
import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default function SignInPage() {
  return <AuthForm mode="sign-in" action={signIn} />;
}
