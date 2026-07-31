import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { MorningBriefEditorWithAI } from "@/components/admin/ai/MorningBriefEditorWithAI";

export const dynamic = "force-dynamic";

export default async function NewMorningBriefPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return <MorningBriefEditorWithAI authorId={user.id} />;
}