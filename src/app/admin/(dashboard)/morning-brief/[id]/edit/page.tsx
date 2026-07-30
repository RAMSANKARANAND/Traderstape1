import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getMorningBriefById } from "@/lib/db-raw";
import { MorningBriefEditorWithAI } from "@/components/admin/ai/MorningBriefEditorWithAI";

export const dynamic = "force-dynamic";

export default async function EditMorningBriefPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const brief = await getMorningBriefById(params.id);
  if (!brief) {
    redirect("/admin/morning-brief");
  }

  return <MorningBriefEditorWithAI authorId={user.id} existing={brief} />;
}