"use client";

import { toast } from "@/components/ui/toast";
import { exchangeDiscordAction } from "@/server/actions/auth/discord-action";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const DISCORD_ERRORS: Record<string, string> = {
    access_denied: "Cancelaste el acceso con Discord",
    invalid_state: "La sesión de Discord expiró. Inténtalo de nuevo",
    unverified_email: "Discord no tiene un correo verificado",
    inactive: "Tu cuenta está inactiva",
    login_failed: "No se pudo iniciar sesión con Discord",
};

export default function DiscordCallback({
    code,
    error,
}: {
    code?: string;
    error?: string;
}) {
    const router = useRouter();
    const started = useRef(false);

    const { execute } = useAction(exchangeDiscordAction, {
        onSuccess: ({ data }) => {
            if (data?.ok) {
                router.replace("/");
                return;
            }

            toast.add({
                title: "Discord",
                description: data?.msg || "No se pudo completar el acceso con Discord",
                type: "error",
            });
            router.replace("/login");
        },
        onError: () => {
            toast.add({
                title: "Discord",
                description: "No se pudo completar el acceso con Discord",
                type: "error",
            });
            router.replace("/login");
        },
    });

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        if (error || !code) {
            toast.add({
                title: "Discord",
                description: DISCORD_ERRORS[error ?? ""] || "No se pudo iniciar sesión con Discord",
                type: "error",
            });
            router.replace("/login");
            return;
        }

        const storageKey = `discord-exchange:${code}`;
        if (sessionStorage.getItem(storageKey)) return;
        sessionStorage.setItem(storageKey, "1");
        execute({ code });
    }, [code, error, execute, router]);

    return (
        <main className="grid h-svh place-items-center bg-neutral-100/70 text-sm text-black/70 dark:bg-[#050505] dark:text-white/70">
            Conectando con Discord...
        </main>
    );
}
