// Custom Worker entry point for OpenNext on Cloudflare.
// This wraps the OpenNext-generated fetch handler and adds a native
// scheduled() handler so Cloudflare Cron Triggers actually fire.
//
// Docs: https://opennext.js.org/cloudflare/howtos/custom-worker

// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  async scheduled(_event: any, env: any, _ctx: any) {
    const cronSecret = env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[scheduled] CRON_SECRET is not configured — skipping cron run");
      return;
    }

    const baseUrl = env.APP_URL || "https://traderstape1new.workers.dev";
    const url = `${baseUrl}/api/cron/news-roundup`;

    try {
      const response = await fetch(url, {
        headers: {
          "x-cron-secret": cronSecret,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[scheduled] Cron endpoint returned ${response.status}:`, text);
        return;
      }

      const data = await response.json();
      console.log("[scheduled] News roundup completed:", data);
    } catch (error) {
      console.error("[scheduled] News roundup failed:", error);
    }
  },
};
