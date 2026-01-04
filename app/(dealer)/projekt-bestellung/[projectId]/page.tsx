import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import SeedProjectCartClient from "./seed-client";

type PageProps = {
  params: {
    projectId: string;
  };
};

export default async function ProjektBestellungPage({ params }: PageProps) {
  const { projectId } = params;

  if (!projectId) notFound();

  // 🔒 nur Validierung auf Server
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Existiert das Projekt überhaupt?
  const { data: submission } = await supabase
    .from("submissions")
    .select("submission_id")
    .eq("project_id", projectId)
    .eq("typ", "projekt")
    .limit(1)
    .maybeSingle();

  if (!submission) notFound();

  // ✅ Ab hier: Client übernimmt alles
  return <SeedProjectCartClient projectId={projectId} />;
}
