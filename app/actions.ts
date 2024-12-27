"use server";

import { cosmicBucketConfig } from "@/lib/cosmic";

type PriceType = {
  currency: string;
  unit_amount: number;
  recurring?: { interval: string; interval_count: number };
};

type PriceVariant = {
  label: string;
  price: number;
  stripe_price_id: string | null;
};

export async function syncWithStripe(
  stripe_secret_key: string,
  cosmic_object_id: string,
  bucket_slug: string,
  read_key: string,
  write_key: string,
  product_id: string
) {
  const stripe = require("stripe")(stripe_secret_key);
  const cosmic = cosmicBucketConfig(bucket_slug, read_key, write_key);

  const { object } = await cosmic.objects
    .findOne({
      id: cosmic_object_id,
    })
    .status("any");

  // Update product details in Stripe
  await stripe.products.update(product_id, {
    name: object.title,
    images: [
      `${object.metadata.image.imgix_url}?w=600&auto=format,compression`,
    ],
  });

  // Handle price variants if they exist
  if (object.metadata.price_variants?.length > 0) {
    const updatedPriceVariants = await Promise.all(
      object.metadata.price_variants.map(async (variant: PriceVariant) => {
        const priceData: PriceType = {
          currency: "USD",
          unit_amount: variant.price * 100,
        };

        if (object.metadata.recurring?.is_recurring) {
          priceData.recurring = {
            interval: object.metadata.recurring.interval.key,
            interval_count: object.metadata.recurring.interval_count,
          };
        }

        const newPrice = await stripe.prices.create({
          product: product_id,
          ...priceData,
          nickname: variant.label, // Add label as price nickname in Stripe
        });

        return {
          ...variant,
          stripe_price_id: newPrice.id,
        };
      })
    );

    // Update Cosmic with new stripe_price_ids
    await cosmic.objects.updateOne(cosmic_object_id, {
      metadata: {
        price_variants: updatedPriceVariants,
      },
    });

    // Set the first price as default
    await stripe.products.update(product_id, {
      default_price: updatedPriceVariants[0].stripe_price_id,
    });

    // Deactivate all other prices for this product that aren't in our variants
    const prices = await stripe.prices.list({ product: product_id });
    const currentPriceIds = updatedPriceVariants.map((v) => v.stripe_price_id);
    for (const price of prices.data) {
      if (!currentPriceIds.includes(price.id)) {
        await stripe.prices.update(price.id, { active: false });
      }
    }
  } else {
    // Handle single price case (existing logic)
    let default_price_data: PriceType = {
      currency: "USD",
      unit_amount: object.metadata.price * 100,
    };

    if (object.metadata.recurring?.is_recurring) {
      default_price_data.recurring = {
        interval: object.metadata.recurring.interval.key,
        interval_count: object.metadata.recurring.interval_count,
      };
    }

    const newPrice = await stripe.prices.create({
      product: product_id,
      ...default_price_data,
    });

    await stripe.products.update(product_id, {
      default_price: newPrice.id,
    });

    // Deactivate old prices
    const prices = await stripe.prices.list({ product: product_id });
    for (const price of prices.data) {
      if (price.id !== newPrice.id) {
        await stripe.prices.update(price.id, { active: false });
      }
    }
  }
}
