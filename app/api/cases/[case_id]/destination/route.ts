import { NextResponse } from "next/server";
import { resolveCaseDestination } from "@/lib/simulador/case-destination";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ case_id: string }> },
) {
  const { case_id } = await params;
  const destination = await resolveCaseDestination(case_id);

  if ("error" in destination) {
    return NextResponse.json(
      { error: destination.error },
      { status: destination.status },
    );
  }

  return NextResponse.json(destination);
}
