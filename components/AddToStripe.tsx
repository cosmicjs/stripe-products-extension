"use client"

import { useState } from "react"
import { CheckCircleIcon, Loader2 } from "lucide-react"

import { cosmicBucketConfig } from "@/lib/cosmic"
import { Button } from "@/components/ui/button"

export function AddToStripe({
  object,
  searchParams,
}: {
  object?: any
  searchParams: any
}) {
  const cosmic = cosmicBucketConfig(
    searchParams.bucket_slug,
    searchParams.read_key,
    searchParams.write_key
  )
  const stripe = require("stripe")(searchParams.stripe_secret_key)
  const [submitting, setSubmitting] = useState(false)
  const [added, setAdded] = useState(false)
  async function handleAddToStripe() {
    setSubmitting(true)
    const product = await stripe.products.create({
      name: object.title,
      metadata: {
        cosmic_object_id: object.id,
      },
      images: [object.metadata.gallery[0].image.imgix_url],
      default_price_data: {
        currency: "USD",
        unit_amount: object.metadata.price * 100,
      },
    })
    console.log(product)
    await cosmic.objects.updateOne(object.id, {
      metadata: {
        stripe_product_id: product.id,
      },
    })
    setSubmitting(false)
    setAdded(true)
  }
  if (added) {
    setTimeout(() => {
      location.reload()
    }, 2000)
    return (
      <div className="flex">
        <CheckCircleIcon className="mr-2 mt-1 size-4 text-green-400" /> Success!
        Product added.
      </div>
    )
  }
  return (
    <div>
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
    </div>
  )
}
