import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Active le mode brouillon (preview) pour visualiser les contenus non publiés.
// Protégé par un secret partagé (PREVIEW_SECRET).
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const path = req.nextUrl.searchParams.get("path") || "/";
  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: "invalid_secret" }, { status: 401 });
  }
  (await draftMode()).enable();
  redirect(path);
}
