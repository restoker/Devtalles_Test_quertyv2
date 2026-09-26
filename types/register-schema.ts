import z from "zod";
import { passwordSchema } from "@/types/user-admin-schema";

export const registerSchema = z.object({
    firstName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(70),
    lastName: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres").max(70),
    email: z.email("Correo electrónico inválido"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
})
    .refine((data) => data.confirmPassword === data.password, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    })

export type RegisterSchema = z.infer<typeof registerSchema>;
