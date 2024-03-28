/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import { cosmicBucketConfig } from "@/lib/cosmic";
import { AddStripeProduct } from "@/components/AddStripeProduct";
import { DisplayStripeProduct } from "@/components/DisplayStripeProduct";
import { InstallationSteps } from "@/app/InstallationSteps";

type ObjectMetadataType = {
  price: number;
  recurring: {
    is_recurring: boolean;
    interval: string;
  };
};

type searchParamsType = {
  bucket_slug: string;
  read_key: string;
  write_key: string;
  location: string;
  object_id: string;
  stripe_secret_key: string;
};

async function getContent(searchParams: searchParamsType) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  );
  const cosmic_object_id = searchParams.object_id;
  let content;
  // If viewing from main extension page
  const { object } = await cosmic.objects.findOne({
    id: cosmic_object_id,
  });
  // Init Stripe
  const stripe_secret_key = searchParams.stripe_secret_key;
  // Check for stripe
  if (!content && !stripe_secret_key) {
    return (
      <div className="my-6">
        Go to the settings for this extension and add the{" "}
        <code>stripe_secret_key</code> to Query parameters to connect to Stripe.
      </div>
    );
  } else {
    const stripe = require("stripe")(stripe_secret_key);
    const product = await stripe.products.retrieve(
      object.metadata.stripe_product_id
    );
    // Check that Object has correct metafields
    if (!isValidProduct(object.metadata))
      return (
        <div className="my-6">
          This Object is missing the required metafields to create a product in
          Stripe. Go to Object type / Settings and make sure the required fields
          are available: - <code>price</code> (Number) -{" "}
          <code>stripe_product_id</code> (Text) -<code>recurring</code> (Parent)
          - <code>is_recurring</code> (Switch) - <code>interval</code> (Select
          dropdown "month" or "year"). Go to the Stripe products extension
          installation guide for more information.
        </div>
      );
    // If valid product Object and product active
    if (!content && product && product.active === true) {
      return (
        <DisplayStripeProduct
          product_id={product.id}
          is_live={product.livemode}
        />
      );
    } else {
      return <AddStripeProduct object={object} searchParams={searchParams} />;
    }
  }
}

function isValidProduct(objectMetadata: ObjectMetadataType) {
  if (!objectMetadata.price) return false;
  if (
    objectMetadata.recurring?.is_recurring &&
    !objectMetadata.recurring.interval
  )
    return false;
  return true;
}

export default async function IndexPage({
  searchParams,
}: {
  searchParams: searchParamsType;
}) {
  const cosmic_object_id = searchParams.object_id;
  return (
    <section className="px-4">
      <div className="mt-6 w-full">
        <div className="mb-6 flex items-center">
          <img
            alt="Stripe icon"
            src="https://imgix.cosmicjs.com/13f2b2e0-eaef-11ee-b074-b5c8fe3ef189-Stripe.svg?w=40&h=40"
            className="mr-4 size-10 rounded"
          />
          <h1>Stripe Products</h1>
        </div>
        {!cosmic_object_id && <InstallationSteps />}
        {getContent(searchParams)}
      </div>
    </section>
  );
}
