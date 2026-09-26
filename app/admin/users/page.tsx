import type { Metadata } from "next";
import SidebarApp from "../_ui/Sidebar";
import UsersTable from "./_ui/UsersTable";
import { getAllUsersAction } from "@/server/actions/users/get-all-users-action";

export const metadata: Metadata = {
    title: "Usuarios | Admin Devtalles",
    description: "Gestión y administración de usuarios de la plataforma Devtalles.",
};

export default async function UsersPage() {
    const response = await getAllUsersAction();
    const initialUsers = response.ok && response.data ? response.data : [];
    const errorMessage = !response.ok ? response.msg : undefined;

    return (
        <SidebarApp>
            <UsersTable initialUsers={initialUsers} errorMessage={errorMessage} />
        </SidebarApp>
    );
}
