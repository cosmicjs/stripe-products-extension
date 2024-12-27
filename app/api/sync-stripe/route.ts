import { NextResponse } from "next/server";

import { syncWithStripe } from "@/app/actions";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    await syncWithStripe(
      formData.get("stripe_secret_key") as string,
      formData.get("cosmic_object_id") as string,
      formData.get("bucket_slug") as string,
      formData.get("read_key") as string,
      formData.get("write_key") as string,
      formData.get("product_id") as string
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
