'use server';

import { auth } from '@/server/auth';
import type { Questionnaire } from '@/types/questionnaire-schema';

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const msg = (body as { message: string | string[] }).message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return fallback;
}

export async function getActiveQuestionnairesAction() {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: 'No tiene permisos para realizar esta operacion' };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}/api/questionnaires/active`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.tokenAuth}`,
      },
      cache: 'no-store',
    });

    const body = await resp.json().catch(() => null);
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: errorMessage(body, 'Error al obtener los cuestionarios activos'),
      };
    }

    return {
      ok: true as const,
      data: (body as { data: Questionnaire[] }).data,
      msg: 'Cuestionarios activos obtenidos exitosamente',
    };
  } catch {
    return { ok: false as const, msg: 'Error al obtener los cuestionarios activos' };
  }
}
