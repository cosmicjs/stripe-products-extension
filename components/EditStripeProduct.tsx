"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export async function EditStripeProduct({
  product,
  price,
}: {
  product: any;
  price: any;
}) {
  const [title, setTitle] = useState(product.name);
  const [price_unit_amount, setPrice] = useState(price.unit_amount / 100);
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          value={price_unit_amount}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>
      <Button>Edit Product</Button>
    </div>
  );
}
