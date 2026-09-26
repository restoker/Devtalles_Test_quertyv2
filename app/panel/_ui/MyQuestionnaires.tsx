"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { AssessmentListItem } from "@/types/assessment-schema";
import { getAssessmentsAction } from "@/server/actions/assessments/get-assessments-action";
import { getActiveQuestionnairesAction } from "@/server/actions/assessments/get-active-questionnaires-action";
import { isAssessmentCompleted } from "@/app/admin/assessments/_ui/answer-utils";

function formatCreatedAt(iso: string): string {
    try {
        return new Intl.DateTimeFormat("es-ES", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export default function MyQuestionnaires() {
    const [attempts, setAttempts] = useState<AssessmentListItem[]>([]);
    const [ready, setReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadList = useCallback(async () => {
        setLoadError(null);
        const [assessmentsRes, questionnairesRes] = await Promise.all([
            getAssessmentsAction(),
            getActiveQuestionnairesAction(),
        ]);

        if (!assessmentsRes.ok) {
            setLoadError(assessmentsRes.msg);
            setAttempts([]);
            setReady(true);
            return;
        }

        const titleById = new Map<number, string>();
        if (questionnairesRes.ok) {
            for (const questionnaire of questionnairesRes.data) {
                titleById.set(questionnaire.id, questionnaire.title);
            }
        }

        setAttempts(
            assessmentsRes.data.map((row) => ({
                ...row,
                questionnaireTitle:
                    titleById.get(row.questionnaireId) ?? `Cuestionario #${row.questionnaireId}`,
                status: isAssessmentCompleted(row) ? "completed" : "in_progress",
            }))
        );
        setReady(true);
    }, []);

    useEffect(() => {
        void loadList();
    }, [loadList]);

    const sorted = useMemo(
        () =>
            [...attempts].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
        [attempts]
    );

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 py-2 sm:py-6">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    Mis cuestionarios
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Los cuestionarios que empezaste o ya completaste.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="relative rounded-[2rem] bg-black/[0.02] p-1.5 shadow-2xl shadow-purple-950/5 ring-1 ring-black/[0.06] sm:p-2.5 dark:bg-white/[0.02] dark:ring-white/10"
            >
                <div className="relative overflow-hidden rounded-[calc(2rem-0.625rem)] border border-border/60 bg-card/95 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/80">
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-4 sm:px-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mis intentos
                        </p>
                        <span className="rounded-xl border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                            {ready ? sorted.length : "…"} cuestionario
                            {ready && sorted.length === 1 ? "" : "s"}
                        </span>
                    </div>
                    <ul className="divide-y divide-border/40">
                    {!ready && (
                        <li className="px-6 py-10 text-center text-sm text-muted-foreground">
                            Cargando cuestionarios…
                        </li>
                    )}
                    {ready && loadError && (
                        <li className="space-y-3 px-6 py-10 text-center">
                            <p className="text-sm text-destructive">{loadError}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setReady(false);
                                    void loadList();
                                }}
                                className="text-xs font-semibold text-purple-600 hover:underline"
                            >
                                Reintentar
                            </button>
                        </li>
                    )}
                    {ready && !loadError && sorted.length === 0 && (
                        <li className="px-6 py-10 text-center text-sm text-muted-foreground">
                            Todavía no llenaste ningún cuestionario.
                        </li>
                    )}
                    {ready &&
                        !loadError &&
                        sorted.map((attempt) => {
                            const completed = attempt.status === "completed";
                            return (
                                <li key={attempt.id}>
                                    <Link
                                        href={`/panel/cuestionarios/${attempt.id}`}
                                        className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-purple-500/[0.04] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div
                                                className={cn(
                                                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border",
                                                    completed
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                                        : "border-amber-500/30 bg-amber-500/10 text-amber-600"
                                                )}
                                            >
                                                <HugeiconsIcon
                                                    icon={completed ? Tick02Icon : Clock01Icon}
                                                    strokeWidth={2}
                                                    className="size-4.5"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground group-hover:text-purple-600">
                                                    {attempt.questionnaireTitle}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {formatCreatedAt(attempt.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pl-13 sm:pl-0">
                                            <span
                                                className={cn(
                                                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                    completed
                                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                                )}
                                            >
                                                {completed ? "Completado" : "En progreso"}
                                            </span>
                                            <HugeiconsIcon
                                                icon={ArrowRight01Icon}
                                                strokeWidth={2}
                                                className="size-4 text-muted-foreground"
                                            />
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}
