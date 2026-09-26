"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
// import Image from "next/image";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { loginSchema } from "@/types/login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from 'next-safe-action/hooks'
import { loginAction } from "@/server/actions/auth/login-actions";
import { discordLoginAction } from "@/server/actions/auth/discord-action";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Apple-inspired spring physics (instant response, critically damped)
const SPRING_TRANSITION = { type: "spring", damping: 30, stiffness: 350 } as const;

export default function AuthSectionOne() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })

  const [formError, setFormError] = useState<string | null>(null);

  const { execute, status } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data?.ok) {
        setFormError(null);
        router.push("/");
        return;
      }
      setFormError(data?.msg ?? "No se pudo iniciar sesión. Intenta de nuevo.");
    },
    onError: () => {
      setFormError("No se pudo iniciar sesión. Intenta de nuevo.");
    },
  })

  const handleSubmit = (data: z.infer<typeof loginSchema>) => {
    setFormError(null);
    execute(data)
  };

  return (
    <main className="relative h-svh min-h-svh w-full bg-white p-2.5 sm:p-4 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white flex items-center justify-center overflow-hidden ">
      {/* Container chassis scaled to fit effortlessly within 100dvh */}
      <div className="grid h-full max-h-160 sm:max-h-167.5 lg:max-h-168.75 xl:max-h-172.25 w-full max-w-300 grid-cols-1 lg:grid-cols-[0.96fr_1.04fr] gap-3 sm:gap-4 overflow-hidden">

        {/* =========================================================================
            LEFT CARD: COMPACT LOGIN FORM
           ========================================================================= */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-black/10 bg-white px-6 py-10 sm:px-8 sm:py-12 lg:px-9 lg:py-14 dark:border-white/10 dark:bg-[#0a0a0a] shadow-sm dark:shadow-2xl overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-105 text-center my-auto space-y-5">
            {/* Logo, Editorial Title & Subtitle */}
            <div>
              {/* <Link href="/" className="flex justify-center"> */}
              {/* <span
                  className="text-3xl font-bold"
                >{`{Dev/talles}`}</span> */}
              <AnimatedLogo className="text-3xl font-bold flex justify-center w-fit mx-auto" />
              {/* </Link> */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-[-0.04em] leading-tight text-purple-600 dark:text-white">
                Bienvenido de nuevo
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-black/60 dark:text-white/60 tracking-tight">
                Lluvia de ideas en chat, construye juntos en cowork.
              </p>
            </div>

            {/* Social Logins */}
            <form action={discordLoginAction} className="mt-4 sm:mt-5">
              <SocialButton type="submit" icon={<DiscordIcon />} label="Iniciar sesión con Discord" />
            </form>

            {/* Minimalist Divider */}
            <div className="relative my-3.5 sm:my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <div className="relative bg-white dark:bg-[#0a0a0a] px-3 text-[11px] font-medium text-black/45 dark:text-white/45 uppercase tracking-wider">
                o
              </div>
            </div>

            {/* Login Inputs */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-3.5">
              <Controller
                control={form.control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <FieldBox
                    label="Correo electrónico"
                    type="email"
                    value={value}
                    onChange={onChange}
                    placeholder="nombre@ejemplo.com"
                    autoComplete="email"
                    error={form.formState.errors.email?.message}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <FieldBox
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    value={value || ""}
                    onChange={onChange}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    error={form.formState.errors.password?.message}
                    trailingAction={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="shrink-0 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors cursor-pointer"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />
                )}
              />

              {formError && (
                <p role="alert" className="text-left text-[11px] font-medium text-red-500 select-none">
                  {formError}
                </p>
              )}

              {/* Submit CTA (Instant feedback, Apple press physics) */}
              <button
                type="submit"
                disabled={status === "executing"}
                className="mt-6 flex h-11 sm:h-11.5 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 text-sm sm:text-base font-medium text-white transition-all duration-150 ease-out active:scale-[0.98] hover:bg-purple-700 dark:bg-purple-600 dark:text-black dark:hover:bg-purple-400 disabled:opacity-75 cursor-pointer shadow-sm"
              >
                <span>{status === "executing" ? "Iniciando sesión..." : "Inicia sesión"}</span>
                <ArrowRightIcon className="size-4" />
              </button>
            </form>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-3 text-center text-xs text-black/55 dark:text-white/55">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-black dark:text-white underline underline-offset-2 hover:text-purple-600 transition-colors"
            >
              Crea una cuenta
            </Link>
          </div>
        </motion.div>

        {/* =========================================================================
            RIGHT CARD: CINEMATIC GRAIN SHADER & PROMO
           ========================================================================= */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_TRANSITION}
          className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-black p-7 xl:p-9 text-white shadow-2xl h-full"
        >
          {/* Grain Shader */}
          <GrainGradient
            speed={0.85}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#FC7819", "#FC7819", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-blue-400"
          />

          {/* Vignette overlay */}
          <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-black/80 via-transparent to-black/40" />

          {/* Content Header & Headline (2 lines max, wide container) */}
          <div className="relative z-10">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-mono backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              WORKSPACE // CLUSTER 04
            </div> */}

            <h2 className="mt-6 max-w-md text-4xl xl:text-[48px] font-medium tracking-tighter leading-[0.98] text-white">
              Elige tu camino,
              <br />
              Empieza a crear
            </h2>
          </div>

          {/* Bottom Desktop Download Island */}
          {/* <div className="relative z-10 flex items-center justify-between gap-3 pt-4">
            <div
              className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-white/25 bg-black/30 px-4 text-xs sm:text-sm font-medium text-white/90 backdrop-blur-md transition-all duration-150 ease-out active:scale-[0.98] hover:border-white/50 hover:bg-black/50 hover:text-white"
            >
              <WindowsIcon className="size-4 shrink-0" />
              <span className="truncate">Download for Windows</span>
            </div>

            <div
              className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-white/25 bg-black/30 px-4 text-xs sm:text-sm font-medium text-white/90 backdrop-blur-md transition-all duration-150 ease-out active:scale-[0.98] hover:border-white/50 hover:bg-black/50 hover:text-white"
            >
              <AppleIcon className="size-4 shrink-0" />
              <span className="truncate">macOS</span>
            </div>
          </div> */}
        </motion.div>
      </div>
    </main>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SocialButton({ icon, label, type = "button" }: { icon: ReactNode; label: string; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      className="flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-black/15 bg-white px-3 text-xs sm:text-[13px] font-medium text-black transition-all duration-150 ease-out active:scale-[0.98] hover:bg-black/4 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function FieldBox({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  trailingAction,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  trailingAction?: ReactNode;
  error?: string;
}) {
  const id = `login-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1 text-left">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-black/70 dark:text-white/70 select-none"
      >
        {label}
      </label>
      <div
        className={cn(
          "flex h-11 sm:h-12 items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-xs sm:text-sm transition-all dark:bg-white/5",
          error
            ? "border-red-500/60 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20"
            : "border-black/15 dark:border-white/15 focus-within:border-purple-600 dark:focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-600/20"
        )}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-black dark:text-white outline-none placeholder:text-black/35 dark:placeholder:text-white/35 text-xs sm:text-sm font-medium"
        />
        {trailingAction}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-medium select-none pl-0.5 leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// ICONS
// =============================================================================

function DiscordIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-[#5865F2] ${className}`}
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function AppleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}

function WindowsIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 4.7 10.7 3.6v7.7H3V4.7Zm8.8-1.25L21 2.1v9.2h-9.2V3.45ZM3 12.7h7.7v7.7L3 19.3v-6.6Zm8.8 0H21v9.2l-9.2-1.3v-7.9Z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
