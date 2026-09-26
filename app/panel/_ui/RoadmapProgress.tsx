"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, Route01Icon } from "@hugeicons/core-free-icons";
import { courseTitleFromRoadmap, type RoadmapView } from "@/types/roadmap-schema";
import { updateRoadmapProgressAction } from "@/server/actions/roadmaps/update-roadmap-progress-action";
import { toast } from "@/components/ui/toast";
import AddToMyRoadmapsButton from "@/app/admin/roadmaps/_ui/AddToMyRoadmapsButton";

interface RoadmapProgressProps {
    roadmap: RoadmapView;
    canEdit: boolean;
    backHref: string;
    backLabel: string;
    saveToMine?: {
        mineBasePath: string;
        savedRoadmapId?: number;
    };
}

export default function RoadmapProgress({
    roadmap,
    canEdit,
    backHref,
    backLabel,
    saveToMine,
}: RoadmapProgressProps) {
    const courses = [...roadmap.courses].sort((a, b) => a.sortOrder - b.sortOrder);
    const [progressByCourse, setProgressByCourse] = useState<Record<number, number>>(() =>
        Object.fromEntries(courses.map((course) => [course.courseId, course.progress]))
    );
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [, startTransition] = useTransition();

    const save = (courseId: number, value: number) => {
        const previous = progressByCourse[courseId] ?? 0;
        setProgressByCourse((current) => ({ ...current, [courseId]: value }));
        setPendingId(courseId);
        startTransition(async () => {
            const result = await updateRoadmapProgressAction(roadmap.id, courseId, value);
            setPendingId(null);
            if (!result.ok) {
                setProgressByCourse((current) => ({ ...current, [courseId]: previous }));
                toast.add({
                    title: "No se pudo guardar el progreso",
                    description: result.msg,
                    type: "error",
                });
            }
        });
    };

    return (
        <div className="mx-auto w-full max-w-2xl py-2 sm:py-6">
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <Link
                        href={backHref}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground active:scale-[0.98]"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            strokeWidth={2}
                            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                        />
                        <span>{backLabel}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground/40">/</span>
                    <span className="truncate text-xs font-semibold text-foreground">{roadmap.title}</span>
                </div>

                <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {roadmap.title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {canEdit
                                ? "Ajusta el avance de cada curso de tu ruta."
                                : "Ruta compartida. Agrégala a tus roadmaps para registrar el avance de cada curso."}
                        </p>
                    </div>
                    <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
                        <HugeiconsIcon icon={Route01Icon} strokeWidth={2} className="size-5" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-zinc-950/60"
            >
                {saveToMine && (
                    <div className="mb-6">
                        <AddToMyRoadmapsButton
                            globalId={roadmap.id}
                            savedRoadmapId={saveToMine.savedRoadmapId}
                            mineBasePath={saveToMine.mineBasePath}
                        />
                    </div>
                )}
                {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Esta ruta no tiene cursos.</p>
                ) : (
                    <ol className="flex flex-col gap-5">
                        {courses.map((course, index) => {
                            const value = progressByCourse[course.courseId] ?? course.progress;
                            const title = courseTitleFromRoadmap(course.courseId, course);
                            return (
                                <li key={course.courseId} className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                                            <span className="mr-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                {index + 1}
                                            </span>
                                            {title}
                                        </p>
                                        <span className="text-xs tabular-nums text-muted-foreground">{value}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-purple-600"
                                            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                                        />
                                    </div>
                                    {canEdit && (
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={value}
                                            disabled={pendingId === course.courseId}
                                            aria-label={`Progreso de ${title}`}
                                            onChange={(event) =>
                                                save(course.courseId, Number(event.target.value))
                                            }
                                            className="w-full accent-purple-600"
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </motion.div>
        </div>
    );
}
