/* eslint-disable @next/next/no-img-element */
import { cosmicBucketConfig } from "@/lib/cosmic";
import { AddStripeProduct } from "@/components/AddStripeProduct";
import { DisplayStripeProduct } from "@/components/DisplayStripeProduct";
import { InstallationSteps } from "@/app/InstallationSteps";

export default async function IndexPage({
  searchParams,
}: {
  searchParams: {
    bucket_slug: string;
    read_key: string;
    write_key: string;
    location: string;
    object_id: string;
    stripe_secret_key: string;
  };
}) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  );
  const cosmic_object_id = searchParams.object_id;
  // If viewing from main extension page
  if (!cosmic_object_id) return <InstallationSteps />;

  const { object } = await cosmic.objects.findOne({
    id: cosmic_object_id,
  });
  // Init Stripe
  const stripe_secret_key = searchParams.stripe_secret_key;
  if (!stripe_secret_key)
    return (
      <div className="m-6">
        Go to the settings for this extension and add the{" "}
        <code>stripe_secret_key</code> to Query parameters to connect to Stripe.
      </div>
    );
  const stripe = require("stripe")(stripe_secret_key);
  let product;
  let price;
  if (object.metadata.stripe_product_id) {
    product = await stripe.products.retrieve(object.metadata.stripe_product_id);
    price = await stripe.prices.retrieve(product.default_price);
  }
  return (
    <section className="max-w-[600px] px-4">
      <div className="mt-6 w-full">
        <div className="mb-6 flex items-center">
          <img
            alt="Stripe icon"
            src="https://imgix.cosmicjs.com/13f2b2e0-eaef-11ee-b074-b5c8fe3ef189-Stripe.svg?w=40&h=40"
            className="mr-4 size-10 rounded"
          />
          <h1>Stripe Products</h1>
        </div>
        {product && product.active === true ? (
          <DisplayStripeProduct product_id={product.id} />
        ) : (
          <AddStripeProduct object={object} searchParams={searchParams} />
        )}
      </div>
    </section>
  );
}
