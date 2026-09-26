import z from "zod";

export const userRoleSchema = z.enum(["admin", "client", "user"], {
    message: "El rol debe ser admin, client o user",
});

export type UserRole = z.infer<typeof userRoleSchema>;

/** Backend rule: uppercase + lowercase + number or special, 8–20 chars */
export const passwordSchema = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(20, "La contraseña debe tener como máximo 20 caracteres")
    .regex(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        "Debe incluir mayúscula, minúscula y un número o carácter especial"
    );

export const changePasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

const optionalClientId = z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().uuid().safeParse(v).success, {
        message: "El cliente debe ser un UUID válido",
    });

const baseUserFields = {
    email: z.email("Correo electrónico inválido"),
    first_name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(70, "El nombre debe tener menos de 70 caracteres")
        .trim(),
    last_name: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(70, "El apellido debe tener menos de 70 caracteres")
        .trim(),
    address: z
        .string()
        .min(5, "La dirección debe tener al menos 5 caracteres")
        .max(300, "La dirección debe tener menos de 300 caracteres")
        .trim(),
    role: userRoleSchema,
    client_id: optionalClientId,
    isActive: z.boolean(),
};

export const createUserAdminSchema = z.object({
    ...baseUserFields,
    password: passwordSchema,
});

export type CreateUserAdminSchema = z.infer<typeof createUserAdminSchema>;

export const updateUserAdminSchema = z.object({
    ...baseUserFields,
    password: z.union([passwordSchema, z.literal("")]).optional(),
});

export type UpdateUserAdminSchema = z.infer<typeof updateUserAdminSchema>;

/** Nested client summary from GET /api/user (camelCase output). */
export type AdminUserClient = {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    role: UserRole;
    isActive: boolean;
};

/** User record from Nest user endpoints (camelCase; ignore 2FA fields). */
export type AdminUser = {
    id: string;
    email: string;
    discordId: string | null;
    firstName: string;
    lastName: string | null;
    address: string | null;
    role: UserRole;
    isActive: boolean;
    client: AdminUserClient | null;
    quantityUsers?: number;
};

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Admin",
    client: "Cliente",
    user: "Usuario",
};

export function clientDisplayName(client: AdminUserClient | null | undefined): string {
    if (!client) return "—";
    const name = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return name || client.email;
}
