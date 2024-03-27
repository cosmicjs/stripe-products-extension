import Link from "next/link";
import { CheckCircleIcon, ExternalLinkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export async function DisplayStripeProduct({
  product_id,
}: {
  product_id: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex border border-green-500 p-4 rounded-lg">
        <CheckCircleIcon className="size-4 text-green-500 mr-2 mt-1" /> Product
        added to Stripe
      </div>
      <Link
        className={buttonVariants()}
        href={`https://dashboard.stripe.com/products/${product_id}`}
        target="_blank"
      >
        Edit in Stripe <ExternalLinkIcon className="ml-2 size-4" />
      </Link>
    </div>
  );
}
