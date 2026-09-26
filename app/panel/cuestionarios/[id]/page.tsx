import type { Metadata } from "next";
import { Suspense } from "react";
import SidebarApp from "@/app/admin/_ui/Sidebar";
import AssessmentDetail from "@/app/admin/assessments/[id]/_ui/AssessmentDetail";

export const metadata: Metadata = {
    title: "Cuestionario | Devtalles",
    description: "Respuestas de un cuestionario que llenaste.",
};

export default function PanelQuestionnairePage() {
    return (
        <SidebarApp role="user">
            <Suspense
                fallback={
                    <div className="py-20 text-center text-sm text-muted-foreground">
                        Cargando cuestionario…
                    </div>
                }
            >
                <AssessmentDetail backHref="/panel/cuestionarios" />
            </Suspense>
        </SidebarApp>
    );
}
