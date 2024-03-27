import { createBucketClient } from "@cosmicjs/sdk";

import { MarkdownClient } from "@/components/Markdown";

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || "",
  readKey: process.env.COSMIC_BUCKET_READ_KEY || "",
});

export async function InstallationSteps() {
  const { object } = await cosmic.objects
    .findOne({
      type: "extensions",
      slug: `stripe-products`,
    })
    .props("slug,title,metadata")
    .status("any")
    .depth(1);
  return (
    <div className="py-10">
      <h2 className="mb-6 text-3xl">Installation Guide</h2>
      <MarkdownClient>{object.metadata.installation_guide}</MarkdownClient>
    </div>
  );
}
