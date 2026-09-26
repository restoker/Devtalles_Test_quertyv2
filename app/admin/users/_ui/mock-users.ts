import type { AdminUser, AdminUserClient, UserRole } from "@/types/user-admin-schema";
import { ROLE_LABELS, clientDisplayName } from "@/types/user-admin-schema";

export type { AdminUser, AdminUserClient, UserRole };
export { ROLE_LABELS, clientDisplayName };

/** Clients available for filters/selects: users with role "client". */
export function clientsFromUsers(users: AdminUser[]): AdminUserClient[] {
    return users
        .filter((u) => u.role === "client")
        .map((u) => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            isActive: u.isActive,
        }));
}

export function getClientLabel(
    clientId: string | null | undefined,
    clients: AdminUserClient[]
): string {
    if (!clientId) return "—";
    const found = clients.find((c) => c.id === clientId);
    return found ? clientDisplayName(found) : "Cliente desconocido";
}
