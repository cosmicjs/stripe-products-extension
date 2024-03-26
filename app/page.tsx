/* eslint-disable @next/next/no-img-element */
import { cosmicBucketConfig } from "@/lib/cosmic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function IndexPage({
  searchParams,
}: {
  searchParams: {
    bucket_slug: string
    read_key: string
    write_key: string
    location: string
    object_id: string
    stripe_secret_key: string
  }
}) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  )
  const cosmic_object_id = searchParams.object_id
  if (!cosmic_object_id)
    return <div className="mt-6">View this from the edit Object page.</div>

  const { object } = await cosmic.objects.findOne({
    id: cosmic_object_id,
  })
  // Init Stripe
  const stripe_secret_key = searchParams.stripe_secret_key
  if (!stripe_secret_key)
    return (
      <div className="mt-6">
        Go to the settings for this extension and add the `stripe_secret_key` to
        Query parameters to connect to Stripe.
      </div>
    )
  const stripe = require("stripe")(stripe_secret_key)
  const { data } = await stripe.products.list()
  const product = data.filter(
    (prod: any) => prod?.metadata?.cosmic_object_id === cosmic_object_id
  )[0]

  function AddStripeProduct({ object }: { object?: any }) {
    return (
      <div>
        <h1 className="mb-6">Add {object.title} to Stripe</h1>
        <Button>Add Product</Button>
      </div>
    )
  }

  async function ProductSection({ product }: { product: any }) {
    const price = await stripe.prices.retrieve(product.default_price)
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Edit {product.name}
        </h1>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Title"
            defaultValue={product.name}
          />
        </div>
        <div>
          <Label>Images</Label>
          <p className="mb-4 text-lg text-gray-800 dark:text-dark-gray-800">
            <img
              src={product.images[0]}
              alt={product.name}
              className="size-[100px] rounded-lg object-cover"
            />
          </p>
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            placeholder="Price"
            defaultValue={price.unit_amount / 100}
          />
        </div>
        <Button>Edit Product</Button>
      </div>
    )
  }
  return (
    <section className="container grid items-center gap-6 p-4 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        {product ? (
          <ProductSection product={product} />
        ) : (
          <AddStripeProduct object={object} />
        )}
      </div>
    </section>
  )
}
