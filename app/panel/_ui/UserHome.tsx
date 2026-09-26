"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Alert02Icon,
    ArrowRight01Icon,
    Route01Icon,
    Sparkles,
    TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const ease = [0.32, 0.72, 0, 1] as const;

export type UserHomeRoadmap = {
    id: number;
    title: string;
    courseCount: number;
};

export type UserHomeQuestionnaire = {
    id: number;
    title: string;
    completed: boolean;
};

export type UserHomeData = {
    greetingName: string;
    todayLabel: string;
    errors: string[];
    globals: { total: number; recent: UserHomeRoadmap[] };
    mine: { total: number; recent: UserHomeRoadmap[] };
    questionnaires: {
        total: number;
        completed: number;
        inProgress: number;
        recent: UserHomeQuestionnaire[];
    };
};

function formatCount(value: number) {
    return value.toLocaleString("es-MX");
}

export default function UserHome({ data }: { data: UserHomeData }) {
    const stats = [
        {
            label: "Roadmaps globales",
            value: data.globals.total,
            hint: "Rutas compartidas",
            href: "/admin/roadmaps/globales",
            icon: Sparkles,
        },
        {
            label: "Mis roadmaps",
            value: data.mine.total,
            hint: "Rutas de tu cuenta",
            href: "/admin/roadmaps/mios",
            icon: Route01Icon,
        },
        {
            label: "Ruta personalizada",
            value: data.questionnaires.total,
            hint: "Cuestionarios para armar tu ruta con IA",
            href: "/admin/assessments",
            icon: TaskDaily01Icon,
        },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 py-2 sm:py-6">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {data.todayLabel}
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Hola, {data.greetingName}
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Roadmaps globales, tus rutas y los cuestionarios que llenaste.
                    </p>
                </div>
            </motion.div>

            {data.errors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-destructive"
                >
                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="mt-0.5 size-5 shrink-0" />
                    <div className="space-y-1 text-xs font-medium sm:text-sm">
                        {data.errors.map((error) => (
                            <p key={error}>{error}</p>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.href}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.05 * index, ease }}
                    >
                        <Link
                            href={stat.href}
                            className="group flex h-full flex-col justify-between rounded-[1.6rem] border border-border/60 bg-card/95 p-5 shadow-sm ring-1 ring-black/[0.04] transition-all hover:border-purple-500/35 hover:shadow-lg hover:shadow-purple-950/5 dark:ring-white/10"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex size-10 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <HugeiconsIcon icon={stat.icon} strokeWidth={2} className="size-5" />
                                </span>
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    strokeWidth={2}
                                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                                />
                            </div>
                            <div className="mt-6">
                                <p className="text-3xl font-extrabold tracking-tight text-foreground">
                                    {formatCount(stat.value)}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">{stat.label}</p>
                                <p className="text-xs text-muted-foreground">{stat.hint}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Roadmaps globales" href="/admin/roadmaps/globales" action="Ver todos">
                    <RoadmapRows
                        items={data.globals.recent}
                        empty="Todavía no hay roadmaps globales."
                    />
                </Panel>
                <Panel title="Mis roadmaps" href="/admin/roadmaps/mios" action="Ver todos">
                    <RoadmapRows
                        items={data.mine.recent}
                        empty="Todavía no tienes roadmaps propios."
                    />
                </Panel>
            </div>

            <Panel title="Cuestionarios" href="/admin/assessments" action="Ver todos">
                {data.questionnaires.recent.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-muted-foreground">
                        Todavía no llenaste ningún cuestionario.
                    </p>
                ) : (
                    <ul className="divide-y divide-border/60">
                        {data.questionnaires.recent.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={`/admin/assessments/${item.id}`}
                                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-purple-500/5"
                                >
                                    <p className="truncate text-sm font-semibold tracking-tight">{item.title}</p>
                                    <span
                                        className={cn(
                                            "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
                                            item.completed
                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "size-1.5 rounded-full",
                                                item.completed ? "bg-emerald-500" : "bg-amber-500"
                                            )}
                                        />
                                        {item.completed ? "Completado" : "En progreso"}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    );
}

function RoadmapRows({ items, empty }: { items: UserHomeRoadmap[]; empty: string }) {
    if (items.length === 0) {
        return <p className="px-5 py-8 text-sm text-muted-foreground">{empty}</p>;
    }

    return (
        <ul className="divide-y divide-border/60">
            {items.map((roadmap) => (
                <li key={roadmap.id}>
                    <Link
                        href={`/admin/roadmaps/${roadmap.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-purple-500/5"
                    >
                        <p className="truncate text-sm font-semibold tracking-tight">{roadmap.title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {roadmap.courseCount} {roadmap.courseCount === 1 ? "curso" : "cursos"}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function Panel({
    title,
    href,
    action,
    children,
}: {
    title: string;
    href: string;
    action: string;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/95 ring-1 ring-black/[0.04] dark:ring-white/10">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                <Link
                    href={href}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400"
                >
                    {action}
                </Link>
            </div>
            {children}
        </section>
    );
}
