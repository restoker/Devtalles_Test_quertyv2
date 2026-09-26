"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Cancel01Icon,
  File01Icon,
  Tick02Icon,
  Clock01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type {
  AssessmentListItem,
  QuestionnaireSummary,
} from "@/types/assessment-schema";
import { getAssessmentsAction } from "@/server/actions/assessments/get-assessments-action";
import { getActiveQuestionnairesAction } from "@/server/actions/assessments/get-active-questionnaires-action";
import { createAssessmentAction } from "@/server/actions/assessments/create-assessment-action";
import { isAssessmentCompleted } from "./answer-utils";

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

export default function AssessmentsList() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AssessmentListItem[]>([]);
  const [activeQuestionnaires, setActiveQuestionnaires] = useState<
    QuestionnaireSummary[]
  >([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);

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
      setActiveQuestionnaires(questionnairesRes.data);
      for (const q of questionnairesRes.data) {
        titleById.set(q.id, q.title);
      }
    } else {
      setActiveQuestionnaires([]);
    }

    setAttempts(
      assessmentsRes.data.map((row) => ({
        ...row,
        questionnaireTitle:
          titleById.get(row.questionnaireId) ??
          `Cuestionario #${row.questionnaireId}`,
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
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [attempts]
  );

  const openPicker = async () => {
    setPickerOpen(true);
    setPickerLoading(true);
    const res = await getActiveQuestionnairesAction();
    setPickerLoading(false);
    if (!res.ok) {
      toast.add({
        title: "No se pudieron cargar los cuestionarios",
        description: res.msg,
        type: "error",
      });
      setActiveQuestionnaires([]);
      return;
    }
    setActiveQuestionnaires(res.data);
  };

  const startAssessment = async (questionnaireId: number) => {
    setStartingId(questionnaireId);
    const res = await createAssessmentAction(questionnaireId);
    setStartingId(null);
    if (!res.ok) {
      toast.add({
        title: "No se pudo iniciar el cuestionario",
        description: res.msg,
        type: "error",
      });
      return;
    }
    setPickerOpen(false);
    router.push(`/admin/assessments/${res.data.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 py-2 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Cuestionarios
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Responde uno y, al terminarlo, armamos tu roadmap personalizado con
            IA.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void openPicker()}
          className="group relative inline-flex shrink-0 items-center justify-between gap-3.5 rounded-full bg-purple-600 py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-purple-500 hover:shadow-purple-500/40 active:scale-[0.98]"
        >
          <span>Empezar cuestionario</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5">
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2.5}
              className="size-3.5"
            />
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Elige un cuestionario
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Solo se muestran cuestionarios activos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </button>
              </div>

              <ul className="max-h-[min(70vh,24rem)] space-y-2 overflow-y-auto p-4 sm:p-5">
                {pickerLoading && (
                  <li className="px-2 py-8 text-center text-sm text-muted-foreground">
                    Cargando cuestionarios…
                  </li>
                )}
                {!pickerLoading && activeQuestionnaires.length === 0 && (
                  <li className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No hay cuestionarios activos disponibles.
                  </li>
                )}
                {!pickerLoading &&
                  activeQuestionnaires.map((q) => (
                    <li key={q.id}>
                      <button
                        type="button"
                        disabled={startingId != null}
                        onClick={() => void startAssessment(q.id)}
                        className="group flex w-full items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-left transition-all hover:border-purple-500/40 hover:bg-purple-500/5 active:scale-[0.99] disabled:opacity-60"
                      >
                        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/15 to-fuchsia-500/10 text-purple-600 dark:text-purple-400">
                          <HugeiconsIcon
                            icon={File01Icon}
                            strokeWidth={2}
                            className="size-4.5"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground">
                            {q.title}
                          </span>
                          {q.description && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                              {q.description}
                            </span>
                          )}
                          {startingId === q.id && (
                            <span className="mt-1 block text-[11px] text-purple-600">
                              Iniciando…
                            </span>
                          )}
                        </span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                          className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-purple-600"
                        />
                      </button>
                    </li>
                  ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                Cargando intentos…
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
                Todavía no empezaste un cuestionario. Elige uno y armamos tu ruta
                con IA.
              </li>
            )}
            {ready &&
              !loadError &&
              sorted.map((attempt) => {
                const completed = attempt.status === "completed";
                return (
                  <li key={attempt.id}>
                    <Link
                      href={`/admin/assessments/${attempt.id}`}
                      className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-purple-500/[0.03] sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:hover:bg-purple-500/[0.05]"
                    >
                      <div className="flex min-w-0 items-start gap-3.5">
                        <div
                          className={cn(
                            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border",
                            completed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          <HugeiconsIcon
                            icon={completed ? Tick02Icon : Clock01Icon}
                            strokeWidth={2}
                            className="size-4.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold tracking-tight text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {attempt.questionnaireTitle}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Creada {formatCreatedAt(attempt.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-13 sm:pl-0">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            completed
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          )}
                        >
                          {completed ? "Completada" : "En progreso"}
                        </span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-purple-600"
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
