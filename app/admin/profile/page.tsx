import type { Metadata } from "next";
import SidebarApp from "../_ui/Sidebar";
import ProfilePanel from "./_ui/ProfilePanel";
import { auth } from "@/server/auth";
import { getUserAction } from "@/server/actions/users/get-user-action";
import { ROLE_LABELS, type UserRole } from "@/types/user-admin-schema";

export const metadata: Metadata = {
    title: "Mi perfil | Admin Devtalles",
    description: "Datos de la cuenta con la que iniciaste sesión en el panel.",
};

function roleLabel(role?: string | null) {
    const key = role?.toLowerCase() as UserRole | undefined;
    if (key && key in ROLE_LABELS) return ROLE_LABELS[key];
    return role || "Usuario";
}

export default async function AdminProfilePage() {
    const session = await auth();
    const user = session?.user;
    const fetched = user?.id ? await getUserAction(user.id) : null;
    const account = fetched?.ok ? fetched.data : null;

    const fullName = account
        ? [account.firstName, account.lastName].filter(Boolean).join(" ")
        : [user?.name, user?.lastname].filter(Boolean).join(" ") || user?.email || "Usuario";
    const initials = (
        account
            ? (account.firstName?.[0] || "") + (account.lastName?.[0] || "")
            : (user?.name?.[0] || "") + (user?.lastname?.[0] || user?.name?.[1] || "")
    ).toUpperCase() || "U";
    const email = account?.email ?? user?.email ?? "—";

    const details = [
        { label: "Correo", value: email },
        { label: "Rol", value: roleLabel(account?.role ?? user?.role) },
        ...(account
            ? [
                  { label: "Dirección", value: account.address || "—" },
                  { label: "Estado", value: account.isActive ? "Activo" : "Inactivo" },
                  { label: "Discord", value: account.discordId ? "Conectado" : "No conectado" },
              ]
            : []),
    ];

    return (
        <SidebarApp role={session?.user.role?.toLowerCase() === "admin" ? "admin" : "user"}>
            <ProfilePanel
                fullName={fullName}
                initials={initials}
                email={email}
                image={user?.image}
                details={details}
                error={fetched && !fetched.ok ? fetched.msg : null}
            />
        </SidebarApp>
    );
}
