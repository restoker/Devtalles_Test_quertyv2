"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { registerSchema } from "@/types/register-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { registerAction } from "@/server/actions/auth/register-action";
import { discordLoginAction } from "@/server/actions/auth/discord-action";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

const SPRING_TRANSITION = { type: "spring", damping: 30, stiffness: 350 } as const;

const images = [
  "https://cdn.cosmos.so/b9e0af40-f4e6-450a-91a6-51294cb76e64?format=webp",
  "https://cdn.cosmos.so/84c84e48-72f1-465e-9d6b-7bc8dbea845e?format=webp",
  "https://cdn.cosmos.so/80ee8085-596f-43a9-9520-b9579b0f2caf?format=webp",
  "https://cdn.cosmos.so/81e39797-52ea-4284-9fda-0e13f2a9b103?format=webp",
];

const prompts = [
  "private in a bot channel, 8k in the style of a painting, realism, Romantic style, a beautiful Swedish summer with a field of daisies a young blond Nordic woman in a white Romantic dress she is blocking the flowers, sunny summer day, intense beautiful colors",
  "Ultra realistic luxury eyewear campaign portrait, elegant woman wearing premium tortoiseshell glasses, warm mocha brown background, bright soft studio lighting, glowing skin, subtle gold earrings, rich warm color palette, sophisticated fashion photography, clean composition with negative space, magazine cover aesthetic, premium and inviting, hyper realistic",
  "Blurry chaotic timelapse of a faceless crowd moving rapidly through a dark brutalist concrete tunnel, flickering neon lights, motion blur, sensory overload, Fincher neo-noir style, hyper-kinetic, raw aesthetic",
  "Retro 1980s dark fantasy cartoon illustration, cult t-shirt graphic style. Close-up shot of a white duck smoking, the mascot for Camel cigarettes. He is depicted as a cartoon duck with human-like attributes, wearing dark, thick-rimmed sunglasses that reflect a subtle image of palm trees.",
];


// const termsText = (
//   <>
//     By creating an account, you agree to our{" "}
//     <a href="#" className="font-medium text-black/60 underline underline-offset-2 hover:text-black dark:text-white/60 dark:hover:text-white">
//       Terms of Service
//     </a>{" "}
//     and{" "}
//     <a href="#" className="font-medium text-black/60 underline underline-offset-2 hover:text-black dark:text-white/60 dark:hover:text-white">
//       Privacy Policy
//     </a>
//   </>
// );

export default function AuthSectionTwo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { execute, status } = useAction(registerAction, {
    onSuccess: ({ data }) => {
      if (data?.ok) {
        toast.add({
          title: 'Register success ✅',
          description: data.msg,
          type: 'success',
        });
        router.replace('/login');
      } else {
        toast.add({
          title: 'Register error 😢',
          description: data?.msg || 'Something went wrong',
          type: 'error',
        });
      }
    },
    onError: ({ error }) => {
      toast.add({
        title: 'Error al registrar 😢',
        description: 'Ha ocurrido un error al intentar registrar tu cuenta',
        type: 'error',
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof registerSchema>) => {
    execute(data);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative h-svh max-h-svh w-full bg-neutral-100/70 p-2.5 sm:p-4 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white flex items-center justify-center overflow-hidden">
      {/* Container chassis scaled to fit completely inside 100dvh without scroll */}
      <div className="grid h-full max-h-160 sm:max-h-167.5 lg:max-h-155 xl:max-h-162.5 w-full max-w-300 grid-cols-1 lg:grid-cols-[0.96fr_1.04fr] gap-3 sm:gap-4 overflow-hidden">

        {/* =========================================================================
            LEFT CARD: MIDJOURNEY SHOWCASE (BENTO + PROMPT HUD)
           ========================================================================= */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_TRANSITION}
          className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-black px-6 py-5 xl:px-8 xl:py-6 text-white shadow-2xl h-full"
        >
          <div className="flex w-full max-w-115 mx-auto flex-col items-center h-full justify-between">
            {/* Header / Brand */}
            <div className="flex items-center gap-2.5 text-base font-medium text-white select-none">
              {/* <MidjourneyLogo className="size-5" /> */}
              <AnimatedLogo className="text-xl font-bold flex justify-center w-fit mx-auto text-white mix-blend-difference" />
            </div>

            {/* Gapless Bento Image Grid (Strictly sized for viewport fit) */}
            <div className="relative mt-2.5 grid w-full grid-cols-[1.5fr_1fr] gap-2 rounded-xl">
              {/* <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-linear-to-b from-black to-transparent from-10%" /> */}
              {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-linear-to-t from-black to-transparent from-10%" /> */}

              <ImageTile src={images[0]} active={activeIndex === 0} onClick={() => setActiveIndex(0)} className="row-span-2 h-38.5 xl:h-42" />
              <ImageTile src={images[1]} active={activeIndex === 1} onClick={() => setActiveIndex(1)} className="h-18.25 xl:h-20" />
              <ImageTile src={images[3]} active={activeIndex === 3} onClick={() => setActiveIndex(3)} className="h-18.25 xl:h-20" />
              <ImageTile src={images[2]} active={activeIndex === 2} onClick={() => setActiveIndex(2)} className="col-span-2 h-18.25 xl:h-20" />
            </div>

            {/* Prompt Display Capsule */}
            <div className="mt-2.5 w-full rounded-xl border border-dashed border-white/15 bg-white/2 px-3.5 py-2.5 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <p className="line-clamp-2 flex-1 text-[11px] leading-4 text-white/50">
                  <span className="font-semibold text-white">/imagine</span> {prompts[activeIndex]}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveIndex((curr) => (curr + 1) % images.length)}
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white transition-all duration-150 ease-out active:scale-[0.92] hover:bg-white/30 cursor-pointer"
                  aria-label="Next prompt"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Editorial Tagline */}
            <p className="mt-1.5 max-w-75 text-center text-xs sm:text-[13px] leading-snug text-white/80 font-normal">
              A creative workspace for visionaries and builders
            </p>

            {/* Prompt Indicator Dots */}
            <div className="mt-1 flex gap-1.5 pb-1">
              {prompts.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === index ? "w-7 bg-white" : "w-3 bg-white/30 hover:bg-white/50"
                    }`}
                  aria-label={`Show prompt ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            RIGHT CARD: REGISTRATION FORM (COMPACT & VIEWPORT FITTED)
           ========================================================================= */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-black/10 bg-white p-5 sm:p-7 md:p-8 lg:p-7 xl:p-8 dark:border-white/10 dark:bg-[#0a0a0a] shadow-sm dark:shadow-2xl overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-105 text-center my-auto">
            {/* Logo, Header */}
            <div>
              {/* <Link href="/" className="flex justify-center"> */}
              {/* <span
                  className="text-3xl font-bold"
                >{`{Dev/talles}`}</span> */}
              <AnimatedLogo className="text-3xl font-bold flex justify-center w-fit mx-auto" />
              {/* </Link> */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-[-0.04em] leading-tight text-purple-600 dark:text-white">
                Crear una cuenta
              </h1>
              <p className="mt-0.5 text-xs text-black/55 dark:text-white/55">
                Únete a la red creativa colaborativa
              </p>
            </div>

            {/* Social Logins */}
            <form action={discordLoginAction} className="mt-3.5 sm:mt-4">
              <SocialButton type="submit" icon={<DiscordIcon />} label="Registrarse con Discord" />
            </form>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <div className="relative bg-white dark:bg-[#0a0a0a] px-3 text-[11px] font-medium text-black/45 dark:text-white/45 uppercase tracking-wider">
                o
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-2.5 sm:space-y-3 text-left"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <FieldBox
                      label="Nombre"
                      placeholder="Juan"
                      value={value}
                      onChange={onChange}
                      autoComplete="given-name"
                      error={form.formState.errors.firstName?.message}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <FieldBox
                      label="Apellido"
                      placeholder="Pérez"
                      value={value}
                      onChange={onChange}
                      autoComplete="family-name"
                      error={form.formState.errors.lastName?.message}
                    />
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <FieldBox
                    label="Correo electrónico"
                    placeholder="nombre@ejemplo.com"
                    type="email"
                    value={value}
                    onChange={onChange}
                    autoComplete="email"
                    error={form.formState.errors.email?.message}
                  />
                )}
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <FieldBox
                      label="Contraseña"
                      placeholder="••••••••••••"
                      type={showPassword ? "text" : "password"}
                      value={value}
                      onChange={onChange}
                      autoComplete="new-password"
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

                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <FieldBox
                      label="Confirmar contraseña"
                      placeholder="••••••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      value={value}
                      onChange={onChange}
                      autoComplete="new-password"
                      error={form.formState.errors.confirmPassword?.message}
                      trailingAction={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="shrink-0 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      }
                    />
                  )}
                />
              </div>
              {!form.formState.errors.password ? (
                <p className="text-[11px] leading-snug text-black/45 dark:text-white/45">
                  Mayúscula, minúscula y un número o carácter especial. Entre 8 y 20 caracteres.
                </p>
              ) : null}

              {/* Submit CTA (Instant press physics, Apple-inspired) */}
              <button
                type="submit"
                disabled={status === "executing"}
                className="mt-6 flex h-10 sm:h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 text-sm sm:text-base font-medium text-white transition-all duration-150 ease-out active:scale-[0.98] hover:bg-purple-700 dark:bg-purple-600 dark:text-black dark:hover:bg-purple-400 disabled:opacity-75 cursor-pointer shadow-sm"
              >
                <span>{status === "executing" ? "Creando cuenta..." : "Crear Cuenta"}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-3 text-center text-xs text-black/55 dark:text-white/55">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-black dark:text-white underline underline-offset-2 hover:text-purple-600 transition-colors"
            >
              Inicia sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// =============================================================================
// SUB-COMPONENTS & ATOMS
// =============================================================================

function ImageTile({
  src,
  active,
  onClick,
  className,
}: {
  src: string;
  active: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`${className} relative overflow-visible rounded-lg cursor-pointer transition-transform duration-200 active:scale-[0.98] ${active ? "z-10" : "z-0"
        }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Generated artwork"
        className={`h-full w-full rounded-lg object-cover transition-opacity duration-500 ${active ? "opacity-100 ring-1 ring-white/30" : "opacity-40 hover:opacity-70"
          }`}
      />
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = `pointer-events-none absolute h-3 w-3 border-white transition-all duration-300 ease-out ${active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0"
    }`;

  return (
    <>
      <div className={`${baseClass} -left-1.5 -top-1.5 border-l border-t ${active ? "" : "-translate-x-1 -translate-y-1"}`} />
      <div className={`${baseClass} -right-1.5 -top-1.5 border-r border-t ${active ? "" : "translate-x-1 -translate-y-1"}`} />
      <div className={`${baseClass} -bottom-1.5 -left-1.5 border-b border-l ${active ? "" : "-translate-x-1 translate-y-1"}`} />
      <div className={`${baseClass} -bottom-1.5 -right-1.5 border-b border-r ${active ? "" : "translate-x-1 translate-y-1"}`} />
    </>
  );
}

function SocialButton({ icon, label, type = "button" }: { icon: ReactNode; label: string; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      className="flex h-9 sm:h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-black/15 bg-white px-3 text-xs sm:text-[13px] font-medium text-black transition-all duration-150 ease-out active:scale-[0.98] hover:bg-black/4 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function FieldBox({
  label,
  value = "",
  placeholder,
  type = "text",
  autoComplete,
  trailingAction,
  onChange,
  error,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  trailingAction?: ReactNode;
  onChange?: (val: string) => void;
  error?: string;
}) {
  const id = `reg-${label.toLowerCase().replace(/\s+/g, "-")}`;

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
          "flex h-9.5 sm:h-10 items-center justify-between gap-2.5 rounded-xl border bg-white px-3 text-xs sm:text-[13px] transition-all dark:bg-white/5",
          error
            ? "border-red-500/60 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20"
            : "border-black/15 dark:border-white/15 focus-within:border-purple-600 dark:focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-600/20"
        )}
      >
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange?.(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-black dark:text-white outline-none placeholder:text-black/35 dark:placeholder:text-white/35 font-medium"
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

function CheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <span className="relative mt-0.5 size-3.5 shrink-0">
        <input
          type="checkbox"
          className="peer size-full appearance-none rounded-[3px] border border-black/25 bg-white checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white cursor-pointer"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6 4.7 8.5 9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}

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
