import type { Metadata } from "next";
import SidebarApp from "../../_ui/Sidebar";
import FormNewQuestionnaire from "./_ui/FormNewQuestionnaire";

export const metadata: Metadata = {
  title: "Nuevo cuestionario | Admin Devtalles",
  description: "Crear un nuevo cuestionario de evaluación para la plataforma.",
};

export default function NewQuestionnairePage() {
  return (
    <SidebarApp>
      <FormNewQuestionnaire />
    </SidebarApp>
  );
}
