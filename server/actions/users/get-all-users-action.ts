"use server";

import { auth } from "@/server/auth";
import type { AdminUser } from "@/types/user-admin-schema";
import { nestMsg } from "./_nest-msg";

export const getAllUsersAction = async (opts?: {
    limit?: number;
    offset?: number;
}) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const limit = opts?.limit ?? 100;
        const offset = opts?.offset ?? 0;
        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(
            `${url}/api/user?limit=${limit}&offset=${offset}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.tokenAuth}`,
                },
                cache: "no-store",
            }
        );
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al obtener los usuarios"),
            };
        }

        return {
            ok: true as const,
            data: (body.data ?? []) as AdminUser[],
            meta: body.meta as
                | { total: number; limit: number; offset: number }
                | undefined,
            msg: "Usuarios obtenidos exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al obtener los usuarios" };
    }
};
