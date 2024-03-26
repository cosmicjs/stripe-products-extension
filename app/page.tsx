import { cosmicBucketConfig } from "@/lib/cosmic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const stripe = require("stripe")(process.env.STRIPE_API_KEY)

function AddStripeProduct({ object }: { object?: any }) {
  return (
    <div>
      <h1>Add {object.title} to Stripe</h1>
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
        <p className="text-lg mb-4 text-gray-800 dark:text-dark-gray-800">
          <img
            src={product.images[0]}
            className="w-[100px] h-[100px] object-cover rounded-lg"
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

export default async function IndexPage({
  searchParams,
}: {
  searchParams: {
    bucket_slug: string
    read_key: string
    write_key: string
    location: string
    object_id: string
  }
}) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  )
  const cosmic_object_id = "65dba337919fff9f84c6ede7"
  const { data } = await stripe.products.list()
  const product = data.filter(
    (prod: any) => prod?.metadata?.cosmic_object_id === cosmic_object_id
  )[0]
  // See the Cosmic docs for more info https://www.cosmicjs.com/docs
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10 p-4">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        {product ? <ProductSection product={product} /> : <AddStripeProduct />}
      </div>
    </section>
  )
}
