import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Quitte le mode brouillon.
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  redirect(req.nextUrl.searchParams.get("path") || "/");
}
