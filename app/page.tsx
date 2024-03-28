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

function isValidObject(objectMetadata: ObjectMetadataType) {
  if (!objectMetadata.price) return false;
  if (!objectMetadata.recurring) return false;
  if (
    objectMetadata.recurring?.is_recurring &&
    !objectMetadata.recurring.interval
  )
    return false;
  return true;
}

async function getContent(searchParams: searchParamsType) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  );
  // Init Stripe
  const stripe_secret_key = searchParams.stripe_secret_key;
  const cosmic_object_id = searchParams.object_id;
  // Check for stripe
  if (!stripe_secret_key) {
    return (
      <div className="my-6">
        Go to the settings for this extension and add the{" "}
        <code>stripe_secret_key</code> to Query parameters to connect to Stripe.
      </div>
    );
  } else {
    // If viewing from main extension page
    const { object } = await cosmic.objects.findOne({
      id: cosmic_object_id,
    });
    // Check that Object has correct metafields
    console.log(object.metadata);
    if (!isValidObject(object.metadata))
      return (
        <div className="my-6">
          This Object is missing the required metafields to create a product in
          Stripe. Go to Object type / Settings and make sure the required fields
          are available:
          <br />
          <br />- <code>image</code> (Image)
          <br />- <code>price</code> (Number)
          <br />- <code>stripe_product_id</code> (Text)
          <br />- <code>recurring</code> (Parent)
          <br />
          -- <code>is_recurring</code> (Switch)
          <br />
          -- <code>interval</code> (Select dropdown "month" or "year")
          <br />
          <br />
          Go to the Stripe products extension page in this dashboard for more
          information.
        </div>
      );
    // If valid product Object and product active
    let product;
    if (object.metadata.stripe_product_id) {
      const stripe = require("stripe")(stripe_secret_key);
      product = await stripe.products.retrieve(
        object.metadata.stripe_product_id
      );
    }
    if (product && product.active === true) {
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
        {!cosmic_object_id ? <InstallationSteps /> : getContent(searchParams)}
      </div>
    </section>
  );
}
