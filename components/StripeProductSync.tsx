"use client";

import { useState } from "react";
import { CheckIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StripeProductSync({ onSync }: { onSync: () => Promise<void> }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync();
      setSynced(true);
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Button onClick={handleSync} disabled={syncing || synced}>
        {syncing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Syncing
          </>
        ) : synced ? (
          <>
            <CheckIcon className="mr-2 size-4" /> Synced
          </>
        ) : (
          "Sync with Stripe"
        )}
      </Button>
      {synced && (
        <p className="text-sm text-green-600">
          Successfully synced! Refresh the page to see updates.
        </p>
      )}
    </>
  );
}
