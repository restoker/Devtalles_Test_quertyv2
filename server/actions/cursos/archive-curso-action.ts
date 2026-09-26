'use server';

import { auth } from "@/server/auth";
import type { CursoItem } from "@/types/curso-schema";
import { revalidatePath } from "next/cache";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const archiveCursoAction = async (id: number) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/admin/courses/${id}/archive`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al archivar el curso"),
            };
        }

        revalidatePath("/admin/cursos");
        return {
            ok: true as const,
            data: body.data as CursoItem,
            msg: "Curso archivado exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al archivar el curso" };
    }
};
