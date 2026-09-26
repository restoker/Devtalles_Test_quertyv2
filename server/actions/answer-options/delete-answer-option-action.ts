'use server';

import { auth } from '@/server/auth';
import { revalidatePath } from 'next/cache';

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const msg = (body as { message: string | string[] }).message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return fallback;
}

export async function deleteAnswerOptionAction(id: string | number) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: 'No tiene permisos para realizar esta operacion' };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}/api/answer-options/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.tokenAuth}`,
      },
    });

    const body = await resp.json().catch(() => null);
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: errorMessage(body, 'Error al eliminar la opción'),
      };
    }

    revalidatePath('/admin/questionnaires');
    return {
      ok: true as const,
      data: (body as { data: { message: string; id: number } }).data,
      msg: 'Opción eliminada exitosamente',
    };
  } catch {
    return { ok: false as const, msg: 'Error al eliminar la opción' };
  }
}
