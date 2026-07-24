import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReportPdf } from "@/lib/simulador/reports/generate-pdf";
import type { ReportPayload } from "@/lib/simulador/reports/model";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ session_id: string }> },
) {
  const { session_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: report, error } = await supabase
    .schema("simulador")
    .from("reports")
    .select("id, status, payload_json, generated_at")
    .eq("simulation_session_id", session_id)
    .eq("report_type", "participant_mirror")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "We could not load the report." },
      { status: 500 },
    );
  }

  if (!report) {
    return NextResponse.json(
      { error: "That report does not exist, or you do not have access to it." },
      { status: 404 },
    );
  }

  if (report.status !== "published" && report.status !== "shared") {
    return NextResponse.json(
      {
        error:
          "The PDF will be available once the report is published.",
      },
      { status: 409 },
    );
  }

  let pdf: Buffer;
  try {
    pdf = await generateReportPdf(report.payload_json as ReportPayload, {
      sessionId: session_id,
      generatedAt: report.generated_at,
    });
  } catch (err) {
    console.error("[report/pdf] generate failed", err);
    return NextResponse.json(
      {
        error: "We could not generate the PDF.",
        detail:
          process.env.NODE_ENV === "production"
            ? undefined
            : err instanceof Error
              ? err.message
              : String(err),
      },
      { status: 500 },
    );
  }

  const filename = `itera-report-${session_id.slice(0, 8)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "private, no-store",
    },
  });
}
