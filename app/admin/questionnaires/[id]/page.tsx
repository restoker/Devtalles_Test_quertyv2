import type { Metadata } from "next";
import SidebarApp from "../../_ui/Sidebar";
import QuestionnaireBuilder from "./_ui/QuestionnaireBuilder";
import { getQuestionnaireAction } from "@/server/actions/questionnaires/get-questionnaire-action";

export const metadata: Metadata = {
  title: "Editar cuestionario | Admin Devtalles",
  description: "Editar título, descripción y preguntas de un cuestionario.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionnairePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getQuestionnaireAction(id);

  return (
    <SidebarApp>
      <QuestionnaireBuilder
        questionnaireId={id}
        initialQuestionnaire={result.ok ? result.data : null}
      />
    </SidebarApp>
  );
}
