'use server';

import { auth } from "@/server/auth";
import type { Questionnaire } from "@/types/assessment-schema";

export const getActiveQuestionnairesAction = async () => {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: "No tiene permisos para realizar esta operacion" };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}/api/questionnaires/active`, {
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
        msg: (body?.message as string) || "Error al obtener los cuestionarios activos",
      };
    }

    const data = (body?.data ?? []) as Questionnaire[];
    return {
      ok: true as const,
      data,
      msg: "Cuestionarios activos obtenidos exitosamente",
    };
  } catch {
    return { ok: false as const, msg: "Error al obtener los cuestionarios activos" };
  }
};
