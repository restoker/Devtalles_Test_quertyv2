'use server';

import { auth } from "@/server/auth";
import type { Assessment } from "@/types/assessment-schema";

async function fetchAssessments(path: string, fallback: string) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: "No tiene permisos para realizar esta operacion" };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.tokenAuth}`,
      },
      cache: "no-store",
    });

    const body = await resp.json();
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: (body?.message as string) || fallback,
      };
    }

    return {
      ok: true as const,
      data: body as Assessment[],
      msg: "Evaluaciones obtenidas exitosamente",
    };
  } catch {
    return { ok: false as const, msg: fallback };
  }
}

export const getAssessmentsAction = async () =>
  fetchAssessments("/api/assessments", "Error al obtener las evaluaciones");

export const getAllAssessmentsAction = async () =>
  fetchAssessments("/api/assessments/all", "Error al obtener las evaluaciones");
