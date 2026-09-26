"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Alert02Icon,
    ArrowRight01Icon,
    CrownIcon,
    Folder01Icon,
    HelpCircleIcon,
    PlusSignIcon,
    SourceCodeIcon,
    Sparkles,
    TaskDaily01Icon,
    UserMultiple03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ROADMAP_SCOPE_LABELS, type RoadmapScope } from "@/types/roadmap-schema";
import { ROLE_LABELS, type UserRole } from "@/types/user-admin-schema";
import type { CourseStatus } from "@/types/curso-schema";

export type DashboardCourse = {
    id: number;
    title: string;
    status: CourseStatus;
    level: string | null;
};

export type DashboardRoadmap = {
    id: number;
    title: string;
    scope?: RoadmapScope;
    courseCount: number;
};

export type DashboardQuestionnaire = {
    id: string;
    title: string;
    isActive: boolean;
    questionCount: number;
};

export type AdminDashboardData = {
    greetingName: string;
    todayLabel: string;
    errors: string[];
    users: {
        total: number | null;
        active: number;
        byRole: Record<UserRole, number>;
    };
    courses: {
        total: number | null;
        published: number;
        draft: number;
        archived: number;
        recent: DashboardCourse[];
    };
    roadmaps: {
        total: number | null;
        recent: DashboardRoadmap[];
    };
    questionnaires: {
        total: number | null;
        active: number;
        recent: DashboardQuestionnaire[];
    };
    assessments: {
        total: number | null;
        completed: number;
        inProgress: number;
    };
    technologies: number | null;
    categories: number | null;
};

const STATUS_LABELS: Record<CourseStatus, string> = {
    published: "Publicado",
    draft: "Borrador",
    archived: "Archivado",
};

const LEVEL_LABELS: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

const ease = [0.32, 0.72, 0, 1] as const;

function formatCount(value: number | null) {
    return value == null ? "—" : value.toLocaleString("es-MX");
}

export default function AdminDashboard({ data }: { data: AdminDashboardData }) {
    const courseTotal = data.courses.published + data.courses.draft + data.courses.archived;
    const userTotal =
        data.users.byRole.admin + data.users.byRole.client + data.users.byRole.user;

    const stats = [
        {
            label: "Usuarios",
            value: data.users.total,
            hint: data.users.total == null ? "No disponible" : `${data.users.active} activos`,
            href: "/admin/users",
            icon: UserMultiple03Icon,
        },
        {
            label: "Cursos",
            value: data.courses.total,
            hint:
                data.courses.total == null
                    ? "No disponible"
                    : `${data.courses.published} publicados`,
            href: "/admin/cursos",
            icon: CrownIcon,
        },
        {
            label: "Roadmaps",
            value: data.roadmaps.total,
            hint: data.roadmaps.total == null ? "No disponible" : "Roadmaps globales",
            href: "/admin/roadmaps",
            icon: Sparkles,
        },
        {
            label: "Cuestionarios",
            value: data.questionnaires.total,
            hint:
                data.questionnaires.total == null
                    ? "No disponible"
                    : `${data.questionnaires.active} activos`,
            href: "/admin/questionnaires",
            icon: TaskDaily01Icon,
        },
    ];

    const actions = [
        { label: "Nuevo usuario", href: "/admin/users/new" },
        { label: "Nuevo curso", href: "/admin/cursos/new" },
        { label: "Nuevo roadmap", href: "/admin/roadmaps/new" },
        { label: "Nuevo cuestionario", href: "/admin/questionnaires/new" },
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
                        Resumen de la plataforma. Revisa el catálogo, las cuentas y las evaluaciones
                        desde un solo lugar.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3.5 py-2 text-xs font-semibold transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.98] dark:hover:text-purple-400"
                        >
                            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                            {action.label}
                        </Link>
                    ))}
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

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

            <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat
                    href="/admin/assessments"
                    icon={HelpCircleIcon}
                    label="Evaluaciones"
                    value={data.assessments.total}
                    hint={
                        data.assessments.total == null
                            ? "No disponible"
                            : `${data.assessments.completed} completadas · ${data.assessments.inProgress} en curso`
                    }
                />
                <MiniStat
                    href="/admin/technologies"
                    icon={SourceCodeIcon}
                    label="Tecnologías"
                    value={data.technologies}
                    hint="Catálogo técnico"
                />
                <MiniStat
                    href="/admin/categorias"
                    icon={Folder01Icon}
                    label="Categorías"
                    value={data.categories}
                    hint="Organización del catálogo"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Estado de cursos" href="/admin/cursos" action="Ver cursos">
                    <Breakdown
                        empty={data.courses.total == null}
                        rows={[
                            {
                                label: STATUS_LABELS.published,
                                value: data.courses.published,
                                total: courseTotal,
                                tone: "bg-emerald-500",
                            },
                            {
                                label: STATUS_LABELS.draft,
                                value: data.courses.draft,
                                total: courseTotal,
                                tone: "bg-amber-500",
                            },
                            {
                                label: STATUS_LABELS.archived,
                                value: data.courses.archived,
                                total: courseTotal,
                                tone: "bg-zinc-400",
                            },
                        ]}
                    />
                </Panel>
                <Panel title="Cuentas por rol" href="/admin/users" action="Ver usuarios">
                    <Breakdown
                        empty={data.users.total == null}
                        rows={[
                            {
                                label: ROLE_LABELS.admin,
                                value: data.users.byRole.admin,
                                total: userTotal,
                                tone: "bg-purple-500",
                            },
                            {
                                label: ROLE_LABELS.client,
                                value: data.users.byRole.client,
                                total: userTotal,
                                tone: "bg-sky-500",
                            },
                            {
                                label: ROLE_LABELS.user,
                                value: data.users.byRole.user,
                                total: userTotal,
                                tone: "bg-zinc-400",
                            },
                        ]}
                    />
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Cursos recientes" href="/admin/cursos" action="Gestionar">
                    {data.courses.recent.length === 0 ? (
                        <EmptyState message="Todavía no hay cursos en el catálogo." />
                    ) : (
                        <ul className="divide-y divide-border/60">
                            {data.courses.recent.map((course) => (
                                <li key={course.id}>
                                    <Link
                                        href="/admin/cursos"
                                        className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-purple-500/5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold tracking-tight">
                                                {course.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {course.level
                                                    ? LEVEL_LABELS[course.level] ?? course.level
                                                    : "Sin nivel"}
                                            </p>
                                        </div>
                                        <StatusPill status={course.status} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Roadmaps recientes" href="/admin/roadmaps" action="Gestionar">
                    {data.roadmaps.recent.length === 0 ? (
                        <EmptyState message="Todavía no hay roadmaps globales." />
                    ) : (
                        <ul className="divide-y divide-border/60">
                            {data.roadmaps.recent.map((roadmap) => (
                                <li key={roadmap.id}>
                                    <Link
                                        href={`/admin/roadmaps/${roadmap.id}`}
                                        className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-purple-500/5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold tracking-tight">
                                                {roadmap.title}
                                            </p>
                                            {roadmap.scope ? (
                                                <p className="text-xs text-muted-foreground">
                                                    {ROADMAP_SCOPE_LABELS[roadmap.scope]}
                                                </p>
                                            ) : null}
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {roadmap.courseCount}{" "}
                                            {roadmap.courseCount === 1 ? "curso" : "cursos"}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            <Panel title="Cuestionarios" href="/admin/questionnaires" action="Ver todos">
                {data.questionnaires.recent.length === 0 ? (
                    <EmptyState message="Todavía no hay cuestionarios." />
                ) : (
                    <ul className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0">
                        {data.questionnaires.recent.map((item) => (
                            <li key={item.id} className="border-border/60 sm:odd:border-r">
                                <Link
                                    href={`/admin/questionnaires/${item.id}`}
                                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-purple-500/5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold tracking-tight">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.questionCount}{" "}
                                            {item.questionCount === 1 ? "pregunta" : "preguntas"}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
                                            item.isActive
                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                : "border-border/70 bg-muted/40 text-muted-foreground"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "size-1.5 rounded-full",
                                                item.isActive ? "bg-emerald-500" : "bg-muted-foreground/50"
                                            )}
                                        />
                                        {item.isActive ? "Activo" : "Inactivo"}
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

function MiniStat({
    href,
    icon,
    label,
    value,
    hint,
}: {
    href: string;
    icon: ComponentProps<typeof HugeiconsIcon>["icon"];
    label: string;
    value: number | null;
    hint: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 rounded-[1.4rem] border border-border/60 bg-card/80 px-4 py-4 transition-colors hover:border-purple-500/35 hover:bg-purple-500/5"
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-foreground">
                <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-lg font-extrabold tracking-tight">{formatCount(value)}</p>
                <p className="text-sm font-semibold">{label}</p>
                <p className="truncate text-xs text-muted-foreground">{hint}</p>
            </div>
        </Link>
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

function Breakdown({
    rows,
    empty,
}: {
    empty: boolean;
    rows: { label: string; value: number; total: number; tone: string }[];
}) {
    if (empty) {
        return <EmptyState message="No se pudo cargar este resumen." />;
    }

    return (
        <ul className="space-y-4 px-5 py-5">
            {rows.map((row) => {
                const percent = row.total === 0 ? 0 : Math.round((row.value / row.total) * 100);
                return (
                    <li key={row.label}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">{row.label}</span>
                            <span className="text-muted-foreground">
                                {row.value} · {percent}%
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn("h-full rounded-full", row.tone)}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function StatusPill({ status }: { status: CourseStatus }) {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
                status === "published" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                status === "draft" &&
                    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                status === "archived" &&
                    "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}

function EmptyState({ message }: { message: string }) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">{message}</p>;
}
