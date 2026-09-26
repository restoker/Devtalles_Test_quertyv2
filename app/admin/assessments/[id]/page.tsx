import type { Metadata } from "next";
import { Suspense } from "react";
import SidebarApp from "../../_ui/Sidebar";
import AssessmentDetail from "./_ui/AssessmentDetail";

export const metadata: Metadata = {
  title: "Detalle de evaluación | Admin Devtalles",
  description: "Responder y completar un intento de evaluación.",
};

export default function AssessmentDetailPage() {
  return (
    <SidebarApp>
      <Suspense
        fallback={
          <div className="py-20 text-center text-sm text-muted-foreground">
            Cargando evaluación…
          </div>
        }
      >
        <AssessmentDetail />
      </Suspense>
    </SidebarApp>
  );
}
