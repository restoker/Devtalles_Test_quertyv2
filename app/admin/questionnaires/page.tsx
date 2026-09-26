import type { Metadata } from "next";
import SidebarApp from "../_ui/Sidebar";
import QuestionnairesTable from "./_ui/QuestionnairesTable";
import { getQuestionnairesAction } from "@/server/actions/questionnaires/get-questionnaires-action";

export const metadata: Metadata = {
  title: "Cuestionarios | Admin Devtalles",
  description: "Gestión y administración de cuestionarios de evaluación en Devtalles.",
};

export default async function QuestionnairesPage() {
  const result = await getQuestionnairesAction(100);

  return (
    <SidebarApp>
      <QuestionnairesTable initialData={result.ok ? result.data : []} />
    </SidebarApp>
  );
}
