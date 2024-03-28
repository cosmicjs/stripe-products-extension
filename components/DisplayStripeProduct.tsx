import Link from "next/link";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export async function DisplayStripeProduct({
  product_id,
  is_live,
}: {
  product_id: string;
  is_live: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-green-500 p-4">
        <CheckIcon className="mr-2 mt-1 size-4 text-green-500" /> Connected to
        Stripe.
      </div>
      <Link
        className={buttonVariants()}
        href={`https://dashboard.stripe.com/${
          !is_live ? "test/" : ""
        }products/${product_id}`}
        target="_blank"
      >
        View in Stripe <ExternalLinkIcon className="ml-2 size-4" />
      </Link>
    </div>
  );
}
