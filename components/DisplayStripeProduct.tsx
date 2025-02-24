"use client";

import Link from "next/link";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";

import { StripeProductSync } from "@/components/StripeProductSync";
import { syncWithStripe } from "@/app/actions";

interface DisplayStripeProductProps {
  product_id: string;
  is_live: boolean;
  stripe_secret_key: string;
  cosmic_object_id: string;
  bucket_slug: string;
  read_key: string;
  write_key: string;
  onSync?: () => Promise<void>;
}

export function DisplayStripeProduct({
  product_id,
  is_live,
  stripe_secret_key,
  cosmic_object_id,
  bucket_slug,
  read_key,
  write_key,
  onSync,
}: DisplayStripeProductProps) {
  const handleSync = async () => {
    try {
      await syncWithStripe(
        stripe_secret_key,
        cosmic_object_id,
        bucket_slug,
        read_key,
        write_key,
        product_id
      );
    } catch (error) {
      console.error("Error syncing:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-green-500 p-4">
        <CheckIcon className="mr-2 mt-1 size-4 text-green-500" /> Connected to
        Stripe.
      </div>
      <div className="flex justify-between gap-4">
        <StripeProductSync onSync={handleSync} />
        <Link
          href={`https://dashboard.stripe.com/${
            !is_live ? "test/" : ""
          }products/${product_id}`}
          target="_blank"
          className="flex items-center"
        >
          View in Stripe <ExternalLinkIcon className="ml-2 size-4" />
        </Link>
      </div>
    </div>
  );
}
