import type { Metadata } from "next";
import SidebarApp from "@/app/admin/_ui/Sidebar";
import MyQuestionnaires from "../_ui/MyQuestionnaires";

export const metadata: Metadata = {
    title: "Mis cuestionarios | Devtalles",
    description: "Cuestionarios que empezaste o completaste.",
};

export default function MyQuestionnairesPage() {
    return (
        <SidebarApp role="user">
            <MyQuestionnaires />
        </SidebarApp>
    );
}
