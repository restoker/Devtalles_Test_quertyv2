'use server';

import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { CreateRoadmapSchema } from "@/types/roadmap-schema";
import type { RoadmapView } from "@/types/roadmap-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const createRoadmapAction = async (input: CreateRoadmapSchema) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/roadmaps`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
            body: JSON.stringify({
                title: input.title.trim(),
                courseIds: input.courseIds.map(Number),
            }),
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al crear el roadmap"),
            };
        }

        revalidatePath("/admin/roadmaps");
        return {
            ok: true as const,
            data: body as RoadmapView,
            msg: "Roadmap creado exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al crear el roadmap" };
    }
};
