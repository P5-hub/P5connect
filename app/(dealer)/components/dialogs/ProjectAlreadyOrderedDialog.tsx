"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ProjectAlreadyOrderedDialog({
  open,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Projekt bereits bestellt</DialogTitle>

          {/* ⚠️ NUR TEXT + <br /> – kein div, kein p */}
          <DialogDescription>
            Dieses Projekt wurde bereits einmal bestellt.
            <br />
            <br />
            Möchten Sie die gleiche Bestellung erneut auslösen?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button onClick={onConfirm}>
            Erneut bestellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
