'use server';

import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { UpdateRoadmapSchema } from "@/types/roadmap-schema";
import type { RoadmapView } from "@/types/roadmap-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const updateRoadmapAction = async (
    id: number,
    input: UpdateRoadmapSchema
) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const payload: { title?: string; courseIds?: number[] } = {};
        if (input.title !== undefined) payload.title = input.title.trim();
        if (input.courseIds !== undefined) {
            payload.courseIds = input.courseIds.map(Number);
        }

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/roadmaps/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
            body: JSON.stringify(payload),
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al actualizar el roadmap"),
            };
        }

        revalidatePath("/admin/roadmaps");
        return {
            ok: true as const,
            data: body as RoadmapView,
            msg: "Roadmap actualizado exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al actualizar el roadmap" };
    }
};
