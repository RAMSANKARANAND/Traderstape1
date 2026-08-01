import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

// Must be called BEFORE the Next.js config is exported.
// Use a self-executing async function to handle errors and ensure initialization completes.
const initPromise = initOpenNextCloudflareForDev().catch((err) => {
  console.error("Failed to initialize Cloudflare context for dev:", err);
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;