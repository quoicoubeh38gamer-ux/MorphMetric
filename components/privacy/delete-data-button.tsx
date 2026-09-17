"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function DeleteDataButton() {
  const [cleared, setCleared] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        onClick={() => {
          store.clearAll();
          setCleared(true);
        }}
      >
        <Trash2 className="h-4 w-4" /> Delete my data
      </Button>
      {cleared ? (
        <span className="text-sm text-accent">
          Done — your report, profile and check-ins were removed from this browser.
        </span>
      ) : null}
    </div>
  );
}
