"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import { nestMsg } from "./_nest-msg";

export const deleteUserAction = async (id: string) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/user/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al eliminar el usuario"),
            };
        }

        revalidatePath("/admin/users");
        return {
            ok: true as const,
            data: body.data as { message: string; id: string },
            msg: nestMsg(
                { message: body.data?.message ?? body.message },
                "Usuario desactivado exitosamente"
            ),
        };
    } catch {
        return { ok: false as const, msg: "Error al eliminar el usuario" };
    }
};
