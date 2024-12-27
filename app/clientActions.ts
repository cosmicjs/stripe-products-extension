"use client";

export async function syncStripeProduct(formData: FormData) {
  const stripe_secret_key = formData.get("stripe_secret_key") as string;
  const cosmic_object_id = formData.get("cosmic_object_id") as string;
  const bucket_slug = formData.get("bucket_slug") as string;
  const read_key = formData.get("read_key") as string;
  const write_key = formData.get("write_key") as string;
  const product_id = formData.get("product_id") as string;

  const response = await fetch("/api/sync-stripe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to sync with Stripe");
  }

  return response.json();
}
