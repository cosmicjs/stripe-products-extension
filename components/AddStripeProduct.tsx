"use client";

import { useState } from "react";
import { CheckIcon, Loader2 } from "lucide-react";

import { cosmicBucketConfig } from "@/lib/cosmic";
import { Button } from "@/components/ui/button";
import { DisplayStripeProduct } from "@/components/DisplayStripeProduct";

type PriceType = {
  currency: string;
  unit_amount: number;
  product?: any;
  nickname?: any;
  recurring?: {
    interval: string;
    interval_count: number;
  };
};

export function AddStripeProduct({
  object,
  searchParams,
}: {
  object?: any;
  searchParams: any;
}) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  );
  const stripe = require("stripe")(searchParams.stripe_secret_key);
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToStripe() {
    setSubmitting(true);
    try {
      // Create the product in Stripe
      const product = await stripe.products.create({
        name: object.title,
        metadata: {
          cosmic_object_id: object.id,
        },
        images: [
          `${object.metadata.image.imgix_url}?w=600&auto=format,compression`,
        ],
      });

      if (object.metadata.price_variants?.length > 0) {
        // Handle price variants
        const updatedPriceVariants = await Promise.all(
          object.metadata.price_variants.map(async (variant: any) => {
            const priceData: PriceType = {
              currency: "USD",
              unit_amount: variant.price * 100,
              product: product.id,
              nickname: variant.label,
            };

            if (object.metadata.recurring?.is_recurring) {
              priceData.recurring = {
                interval: object.metadata.recurring.interval.key,
                interval_count: object.metadata.recurring.interval_count,
              };
            }

            const newPrice = await stripe.prices.create(priceData);
            return {
              ...variant,
              stripe_price_id: newPrice.id,
            };
          })
        );

        // Set the first price as default
        await stripe.products.update(product.id, {
          default_price: updatedPriceVariants[0].stripe_price_id,
        });

        // Update Cosmic with stripe_product_id and updated price variants
        await cosmic.objects.updateOne(object.id, {
          metadata: {
            stripe_product_id: product.id,
            price_variants: updatedPriceVariants,
          },
        });
      } else {
        // Handle single price case
        let priceData: PriceType = {
          currency: "USD",
          unit_amount: object.metadata.price * 100,
          product: product.id,
        };

        if (object.metadata.recurring?.is_recurring) {
          priceData.recurring = {
            interval: object.metadata.recurring.interval.key,
            interval_count: object.metadata.recurring.interval_count,
          };
        }

        // Create the price first
        const price = await stripe.prices.create(priceData);

        // Then update the product with the price ID
        await stripe.products.update(product.id, {
          default_price: price.id,
        });

        // Update Cosmic with just the stripe_product_id
        await cosmic.objects.updateOne(object.id, {
          metadata: {
            stripe_product_id: product.id,
          },
        });
      }

      setAdded(true);
    } catch (error) {
      console.error("Error adding product to Stripe:", error);
    } finally {
      setSubmitting(false);
    }
  }

  if (added) {
    return (
      <div className="flex">
        <CheckIcon className="mr-2 mt-1 size-4 text-green-400" /> Success!
        Product connected to Stripe. Refresh this page to load the Stripe data.
      </div>
    );
  }

  return (
    <div>
      {object.metadata.stripe_product_id ? (
        <DisplayStripeProduct
          product_id={object.metadata.stripe_product_id}
          is_live={!searchParams.stripe_secret_key.includes("test")}
          stripe_secret_key={searchParams.stripe_secret_key}
          cosmic_object_id={object.id}
          bucket_slug={searchParams.bucket_slug}
          read_key={searchParams.read_key}
          write_key={searchParams.write_key}
        />
      ) : (
        <>
          <p className="mb-6">Add {object.title} to Stripe.</p>
          <Button disabled={submitting} onClick={handleAddToStripe}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Submitting
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
