// Custom Worker entry point for OpenNext on Cloudflare.
// Wraps the OpenNext fetch handler and adds a native scheduled() handler
// so Cloudflare Cron Triggers actually fire.
// Docs: https://opennext.js.org/cloudflare/howtos/custom-worker

// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

// @ts-ignore `.open-next/worker.js` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";

const CRON_JOBS = [
  { name: "News roundup", path: "/api/cron/news-roundup" },
  { name: "Tape insight", path: "/api/cron/tape-insight" },
];

async function runJob(baseUrl: string, cronSecret: string, job: { name: string; path: string }) {
  try {
    const response = await fetch(`${baseUrl}${job.path}`, {
      headers: { "x-cron-secret": cronSecret },
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(`[scheduled] ${job.name} returned ${response.status}:`, text);
      return;
    }
    const data = await response.json();
    console.log(`[scheduled] ${job.name} completed:`, data);
  } catch (error) {
    console.error(`[scheduled] ${job.name} failed:`, error);
  }
}

export default {
  fetch: handler.fetch,

  async scheduled(_event: any, env: any, ctx: any) {
    const cronSecret = env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[scheduled] CRON_SECRET is not configured - skipping cron run");
      return;
    }
    const baseUrl = env.APP_URL || "https://traderstape1new.workers.dev";
    ctx.waitUntil(Promise.allSettled(CRON_JOBS.map((job) => runJob(baseUrl, cronSecret, job))));
  },
};
