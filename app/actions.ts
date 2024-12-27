"use server";

import { cosmicBucketConfig } from "@/lib/cosmic";

type PriceType = {
  currency: string;
  unit_amount: number;
  recurring?: { interval: string; interval_count: number };
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

  let default_price_data: PriceType = {
    currency: "USD",
    unit_amount: object.metadata.price * 100,
  };

  if (object.metadata.recurring.is_recurring) {
    default_price_data.recurring = {
      interval: object.metadata.recurring.interval.key,
      interval_count: object.metadata.recurring.interval_count,
    };
  }

  await stripe.products.update(product_id, {
    name: object.title,
    images: [
      `${object.metadata.image.imgix_url}?w=600&auto=format,compression`,
    ],
  });

  const newPrice = await stripe.prices.create({
    product: product_id,
    ...default_price_data,
  });

  await stripe.products.update(product_id, {
    default_price: newPrice.id,
  });
  // Remove all prices that are not the new price, set active to false
  const prices = await stripe.prices.list({ product: product_id });
  for (const price of prices.data) {
    if (price.id !== newPrice.id) {
      await stripe.prices.update(price.id, { active: false });
    }
  }
}
