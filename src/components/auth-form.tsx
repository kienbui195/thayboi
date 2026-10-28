"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  mode: "sign-up" | "sign-in";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const signUp = mode === "sign-up";
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1>{signUp ? "Tạo tài khoản" : "Đăng nhập"}</h1>
        </CardTitle>
        <CardDescription>
          {signUp ? "Tạo tài khoản để lưu hồ sơ và lá số." : "Đăng nhập để xem lá số đã lưu."}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Field data-invalid={!!state.fieldErrors?.email || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={state.email}
                aria-invalid={!!state.fieldErrors?.email || undefined}
              />
              <FieldError>{state.fieldErrors?.email}</FieldError>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.password || undefined}>
              <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={signUp ? "new-password" : "current-password"}
                required
                aria-invalid={!!state.fieldErrors?.password || undefined}
              />
              <FieldError>{state.fieldErrors?.password}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {signUp ? "Đăng ký" : "Đăng nhập"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {signUp ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
            <Link href={signUp ? "/dang-nhap" : "/dang-ky"} className="text-primary hover:underline">
              {signUp ? "Đăng nhập" : "Đăng ký"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
