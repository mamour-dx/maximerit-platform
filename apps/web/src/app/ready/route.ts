import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Readiness — la base est joignable (requête légère). 503 sinon.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getPayload({ config });
    await payload.count({ collection: "users" });
    return NextResponse.json({ status: "ready", db: "ok" });
  } catch (err) {
    return NextResponse.json(
      { status: "not-ready", db: "unreachable", error: err instanceof Error ? err.message : "unknown" },
      { status: 503 },
    );
  }
}
