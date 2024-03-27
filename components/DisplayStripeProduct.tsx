import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export async function DisplayStripeProduct({
  product_id,
}: {
  product_id: string;
}) {
  return (
    <div className="space-y-4">
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
