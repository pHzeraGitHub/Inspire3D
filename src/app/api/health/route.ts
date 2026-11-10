import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await query("SELECT 1");
    return new Response("ok", { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Health check failed:", error);
    return new Response("unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
