import type { Metadata } from "next";
import SidebarApp from "../_ui/Sidebar";
import RolesSecurity from "./_ui/RolesSecurity";

export const metadata: Metadata = {
    title: "Roles y Seguridad | Admin Devtalles",
    description: "Gestión de roles y permisos de la plataforma Devtalles.",
};

export default function RolesPage() {
    return (
        <SidebarApp>
            <RolesSecurity />
        </SidebarApp>
    );
}
