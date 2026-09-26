import type { Metadata } from "next";
import SidebarApp from "../../_ui/Sidebar";
import FormNewUser from "./_ui/FormNewUser";
import { getAllUsersAction } from "@/server/actions/users/get-all-users-action";
import { clientsFromUsers } from "../_ui/mock-users";

export const metadata: Metadata = {
    title: "Nuevo usuario | Admin Devtalles",
    description: "Crear un nuevo usuario en la plataforma Devtalles.",
};

export default async function NewUserPage() {
    const response = await getAllUsersAction();
    const clients = clientsFromUsers(
        response.ok && response.data ? response.data : []
    );

    return (
        <SidebarApp>
            <FormNewUser clients={clients} />
        </SidebarApp>
    );
}
