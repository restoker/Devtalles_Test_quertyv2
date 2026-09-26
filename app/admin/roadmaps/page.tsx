import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SidebarApp from "../_ui/Sidebar";
import RoadmapsTable from "./_ui/RoadmapsTable";
import { auth } from "@/server/auth";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";

export const metadata: Metadata = {
    title: "Roadmaps | Admin Devtalles",
    description: "Gestión y administración de rutas de aprendizaje en Devtalles.",
};

export default async function RoadmapsPage() {
    const session = await auth();
    if (session?.user.role?.toLowerCase() !== "admin") {
        redirect("/admin/roadmaps/mios");
    }

    const response = await getAllRoadmapsAction();
    const initialRoadmaps = response.ok && response.data ? response.data : [];
    const errorMessage = !response.ok ? response.msg : undefined;

    return (
        <SidebarApp role="admin">
            <RoadmapsTable
                initialRoadmaps={initialRoadmaps}
                errorMessage={errorMessage}
            />
        </SidebarApp>
    );
}
