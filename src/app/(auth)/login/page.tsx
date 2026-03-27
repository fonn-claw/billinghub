"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen">
      {/* Left side: 55% */}
      <div
        className="relative flex w-full flex-col items-center justify-center px-8 md:w-[55%]"
        style={{
          backgroundColor: "#F6F8FB",
        }}
      >
        {/* Wave pattern at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-repeat-x"
          style={{
            backgroundImage: "url(/assets/wave-pattern.svg)",
            backgroundPosition: "bottom center",
            backgroundSize: "400px 200px",
            opacity: 0.06,
          }}
        />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Logo + Wordmark */}
          <div className="mb-2 flex items-center justify-center gap-3">
            <Image src="/assets/logo.svg" alt="BillingHub" width={48} height={48} />
            <h1 className="font-heading text-3xl text-[#0C2D48]" style={{ fontWeight: 700 }}>
              BillingHub
            </h1>
          </div>

          {/* Tagline */}
          <p className="mb-10 text-center text-[16px] text-[#6B7A8D]" style={{ fontWeight: 400 }}>
            Marina billing, unified.
          </p>

          {/* Login form */}
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-lg bg-[#DC3545]/10 px-4 py-3 text-sm font-medium text-[#DC3545]">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#0C2D48]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@marina.com"
                required
                className="h-11 rounded-lg border-[#D8DFE8] bg-white px-3 text-[#0C2D48] placeholder:text-[#A0AABB] focus:border-[#1B6B93] focus:ring-[rgba(27,107,147,0.15)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#0C2D48]">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="h-11 rounded-lg border-[#D8DFE8] bg-white px-3 text-[#0C2D48] placeholder:text-[#A0AABB] focus:border-[#1B6B93] focus:ring-[rgba(27,107,147,0.15)]"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-btn-gradient text-[14px] font-medium text-white transition-all hover:brightness-110 hover:shadow-[0_2px_8px_rgba(27,107,147,0.3)] active:translate-y-px active:brightness-95"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo credentials card */}
          <div className="mt-8 rounded-lg bg-[#EEF1F6] p-4">
            <p
              className="mb-3 text-[12px] uppercase tracking-[0.04em] text-[#6B7A8D]"
              style={{ fontWeight: 600 }}
            >
              Demo Accounts
            </p>
            <div className="space-y-2 text-[13px] text-[#0C2D48]">
              <div className="flex items-center justify-between">
                <span className="font-medium">manager@billinghub.app</span>
                <span className="text-[#6B7A8D]">Manager</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">billing@billinghub.app</span>
                <span className="text-[#6B7A8D]">Billing Clerk</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">boater@billinghub.app</span>
                <span className="text-[#6B7A8D]">Customer</span>
              </div>
              <p className="mt-1 text-[12px] text-[#6B7A8D]">Password: demo1234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: 45% hero image (hidden below 768px) */}
      <div className="relative hidden md:block md:w-[45%]">
        {/* Hero image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/assets/hero-marina.png)" }}
        />
        {/* Gradient blend from left */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, #F6F8FB 0%, transparent 60px)",
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
