"use client";

import { useEffect } from "react";
import { useSeedProjectCart } from "@/app/(dealer)/hooks/useSeedProjectCart";

type Props = {
  projectId: string;
};

export default function SeedClient({ projectId }: Props) {
  const { startFromProject } = useSeedProjectCart();

  useEffect(() => {
    if (!projectId) return;
    startFromProject(projectId);
  }, [projectId, startFromProject]);

  return null;
}
