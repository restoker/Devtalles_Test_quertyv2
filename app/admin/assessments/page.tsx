import type { Metadata } from "next";
import SidebarApp from "../_ui/Sidebar";
import AssessmentsList from "./_ui/AssessmentsList";

export const metadata: Metadata = {
  title: "Cuestionarios | Devtalles",
  description: "Responder cuestionarios y gestionar intentos de evaluación.",
};

export default function AssessmentsPage() {
  return (
    <SidebarApp>
      <AssessmentsList />
    </SidebarApp>
  );
}
