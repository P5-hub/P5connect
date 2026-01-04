"use client";

import { useCallback, useState } from "react";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { seedCartFromProjectAction } from "@/app/(dealer)/projekt-bestellung/[projectId]/actions";
import { checkProjectAlreadyOrdered } from "@/app/(dealer)/projekt-bestellung/[projectId]/checkProjectAlreadyOrdered";

export function useSeedProjectCart() {
  const { clearCart, addItem, openCart, setProjectDetails } = useCart();

  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const seed = useCallback(
    async (projectId: string) => {
      const { project, items } = await seedCartFromProjectAction(projectId);

      clearCart("bestellung");

      setProjectDetails({
        submission_id: project.submission_id, // 🔥 P-xxx
        project_id: project.project_id,       // UUID
        project_name: project.project_name,
        customer: project.customer,
      });

      for (const item of items) {
        addItem("bestellung", item);
      }

      openCart("bestellung");
    },
    [clearCart, addItem, openCart, setProjectDetails]
  );

  const startFromProject = useCallback(
    async (projectId: string) => {
      if (!projectId) return;

      const alreadyOrdered = await checkProjectAlreadyOrdered(projectId);

      if (alreadyOrdered) {
        setPendingProjectId(projectId);
        setDialogOpen(true);
        return;
      }

      await seed(projectId);
    },
    [seed]
  );

  const confirmDuplicateOrder = useCallback(async () => {
    if (!pendingProjectId) return;

    setDialogOpen(false);
    await seed(pendingProjectId);
    setPendingProjectId(null);
  }, [pendingProjectId, seed]);

  const cancelDuplicateOrder = useCallback(() => {
    setDialogOpen(false);
    setPendingProjectId(null);
  }, []);

  return {
    startFromProject,
    dialogOpen,
    confirmDuplicateOrder,
    cancelDuplicateOrder,
  };
}
