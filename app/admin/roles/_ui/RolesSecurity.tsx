"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    SecurityCheckIcon,
    ShieldUserIcon,
    User02Icon,
    UserMultiple03Icon,
    Clock01Icon,
} from "@hugeicons/core-free-icons";

const roles = [
    {
        name: "Administrador",
        key: "admin",
        description: "Acceso completo al panel: usuarios, catálogo, cuestionarios y configuración.",
        icon: ShieldUserIcon,
        tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
        name: "Cliente",
        key: "client",
        description: "Acceso a su espacio, rutas y contenido asignado en la plataforma.",
        icon: UserMultiple03Icon,
        tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
    {
        name: "Usuario",
        key: "user",
        description: "Acceso básico a su cuenta, progreso y recursos públicos.",
        icon: User02Icon,
        tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
] as const;

export default function RolesSecurity() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 py-2 sm:py-6">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    Roles y Seguridad
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Define quién puede entrar al panel y qué puede administrar en la plataforma.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-start gap-4 rounded-3xl border border-amber-500/25 bg-amber-500/10 p-5 sm:p-6"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-5" />
                </span>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                        Estamos trabajando en esta funcionalidad
                    </p>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Hoy solo están disponibles los roles base. Seguimos trabajando para agregar más roles
                        y dejar esta sección completa: permisos por módulo, roles personalizados y control de acceso.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {roles.map((role, index) => (
                    <motion.article
                        key={role.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.12 + index * 0.06, ease: [0.32, 0.72, 0, 1] }}
                        className="rounded-[1.75rem] border border-border/60 bg-card/95 p-6 shadow-sm dark:border-white/[0.08] dark:bg-zinc-950/80"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <span className={`flex size-10 items-center justify-center rounded-2xl border ${role.tone}`}>
                                <HugeiconsIcon icon={role.icon} strokeWidth={2} className="size-5" />
                            </span>
                            <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                                {role.key}
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">{role.name}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                    </motion.article>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-center gap-3 rounded-3xl border border-dashed border-border/80 bg-black/[0.02] px-5 py-4 text-sm text-muted-foreground dark:bg-white/[0.02]"
            >
                <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} className="size-5 shrink-0 text-purple-500" />
                <span>La gestión avanzada de seguridad se publicará en esta misma pantalla cuando esté lista.</span>
            </motion.div>
        </div>
    );
}
