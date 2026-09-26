import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SidebarApp from "../../_ui/Sidebar";
import FormEditUser from "./_ui/FormEditUser";
import { getUserAction } from "@/server/actions/users/get-user-action";
import { getAllUsersAction } from "@/server/actions/users/get-all-users-action";
import { clientsFromUsers } from "../_ui/mock-users";

export const metadata: Metadata = {
    title: "Detalle de usuario | Admin Devtalles",
    description: "Consulta y edita los datos de un usuario de Devtalles.",
};

interface UserDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
    const { id } = await params;
    const [userResult, listResult] = await Promise.all([
        getUserAction(id),
        getAllUsersAction(),
    ]);

    if (!userResult.ok || !userResult.data) {
        notFound();
    }

    const clients = clientsFromUsers(
        listResult.ok && listResult.data ? listResult.data : []
    );

    return (
        <SidebarApp>
            <FormEditUser user={userResult.data} clients={clients} />
        </SidebarApp>
    );
}
