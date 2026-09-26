"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import type { AdminUser, UpdateUserAdminSchema } from "@/types/user-admin-schema";
import { nestMsg } from "./_nest-msg";

export const updateUserAction = async (
    id: string,
    input: UpdateUserAdminSchema
) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const payload: Record<string, unknown> = {
            email: input.email,
            first_name: input.first_name,
            last_name: input.last_name,
            address: input.address,
            role: input.role,
            isActive: input.isActive,
        };

        if (input.password && input.password.length > 0) {
            payload.password = input.password;
        }

        if (input.client_id?.trim()) {
            payload.client_id = input.client_id.trim();
        }

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/user/${id}`, {
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
                msg: nestMsg(body, "Error al actualizar el usuario"),
            };
        }

        revalidatePath("/admin/users");
        return {
            ok: true as const,
            data: body.data as AdminUser,
            msg: "Usuario actualizado exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al actualizar el usuario" };
    }
};
