import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isDevBypassActive } from "@/lib/dev/devBypass";

export const runtime = "nodejs";

type JsonRecord = Record<string, unknown>;

type CompanyFileInput = {
  id?: unknown;
  name?: unknown;
  size?: unknown;
  type?: unknown;
};

const EDITABLE_ORG_FIELDS = [
  "name",
  "industry",
  "region",
  "company_size_key",
] as const;

export async function GET() {
  const resolved = await resolveCurrentOrgAdmin();
  if ("response" in resolved) return resolved.response;

  const { admin, organizationId } = resolved;
  const [{ data: organization }, { data: subscription }] = await Promise.all([
    admin
      .schema("simulador")
      .from("organizations")
      .select("id, name, industry, region, company_size_key, metadata, updated_at")
      .eq("id", organizationId)
      .maybeSingle(),
    admin
      .schema("simulador")
      .from("subscriptions")
      .select(
        "id, status, tier, seats, price_usd_total, current_period_end, stripe_customer_id",
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!organization) {
    return NextResponse.json(
      { error: "Organización no encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    serializeSettings(organization as JsonRecord, subscription as JsonRecord | null),
  );
}

export async function PATCH(req: NextRequest) {
  const resolved = await resolveCurrentOrgAdmin();
  if ("response" in resolved) return resolved.response;

  const { admin, organizationId } = resolved;
  const { data: organization } = await admin
    .schema("simulador")
    .from("organizations")
    .select("id, name, industry, region, company_size_key, metadata, updated_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (!organization) {
    return NextResponse.json(
      { error: "Organización no encontrada." },
      { status: 404 },
    );
  }

  let body: JsonRecord;
  try {
    body = (await req.json()) as JsonRecord;
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const update: JsonRecord = {};
  for (const field of EDITABLE_ORG_FIELDS) {
    if (!(field in body)) continue;
    const value = normalizeText(body[field]);
    if (field === "name" && !value) {
      return NextResponse.json(
        { error: "El nombre de la organización es requerido." },
        { status: 400 },
      );
    }
    update[field] = value;
  }

  const metadata = asRecord((organization as JsonRecord).metadata);
  const companyProfile = asRecord(metadata.company_profile);
  const now = new Date();

  if ("website_url" in body) {
    const nextWebsite = normalizeWebsite(body.website_url);
    if (!nextWebsite) {
      return NextResponse.json(
        { error: "Sitio web inválido." },
        { status: 400 },
      );
    }

    const currentWebsite = normalizeText(companyProfile.website_url);
    if (currentWebsite && currentWebsite !== nextWebsite) {
      return NextResponse.json(
        {
          error: "website_locked",
          message: "El sitio web de la organización ya fue confirmado.",
          website_url: currentWebsite,
        },
        { status: 409 },
      );
    }

    companyProfile.website_url = currentWebsite || nextWebsite;
    companyProfile.website_locked_at =
      normalizeText(companyProfile.website_locked_at) || now.toISOString();
  }

  if ("files" in body) {
    if (!Array.isArray(body.files)) {
      return NextResponse.json(
        { error: "files debe ser un arreglo." },
        { status: 400 },
      );
    }

    const files = normalizeCompanyFiles(body.files as CompanyFileInput[]);
    if (files instanceof NextResponse) return files;

    const previousFiles = JSON.stringify(companyProfile.files ?? []);
    const nextFiles = JSON.stringify(files);
    if (previousFiles !== nextFiles) {
      const monthKey = currentMonthKey(now);
      if (companyProfile.files_last_changed_month === monthKey) {
        return NextResponse.json(
          {
            error: "files_monthly_limit",
            message:
              "Los archivos de contexto solo pueden cambiar una vez por mes.",
            files_last_changed_at: companyProfile.files_last_changed_at ?? null,
          },
          { status: 409 },
        );
      }
      companyProfile.files = files;
      companyProfile.files_last_changed_month = monthKey;
      companyProfile.files_last_changed_at = now.toISOString();
    }
  }

  update.metadata = {
    ...metadata,
    company_profile: companyProfile,
  };
  update.updated_at = now.toISOString();

  const { data: saved, error } = await admin
    .schema("simulador")
    .from("organizations")
    .update(update)
    .eq("id", organizationId)
    .select("id, name, industry, region, company_size_key, metadata, updated_at")
    .single();

  if (error || !saved) {
    console.error("[org-settings] update failed", error);
    return NextResponse.json(
      { error: "No pudimos guardar los cambios." },
      { status: 500 },
    );
  }

  const { data: subscription } = await admin
    .schema("simulador")
    .from("subscriptions")
    .select(
      "id, status, tier, seats, price_usd_total, current_period_end, stripe_customer_id",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json(
    serializeSettings(saved as JsonRecord, subscription as JsonRecord | null),
  );
}

async function resolveCurrentOrgAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Dev-only: con el bypass activo resolvemos la org demo REAL (no un mock)
    // para que /empresa cargue y el autosave (PATCH) también sea probable en
    // QA local. Mismo patrón que /api/dashboard; isDevBypassActive es false
    // incondicional en producción (R-06).
    const cookieStore = await cookies();
    if (isDevBypassActive(cookieStore.get("itera_dev_bypass")?.value)) {
      const admin = createAdminClient();
      const { data: demoOrg } = await admin
        .schema("simulador")
        .from("organizations")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (demoOrg?.id) {
        return { admin, organizationId: demoOrg.id as string };
      }
    }
    return {
      response: NextResponse.json({ error: "No autenticado." }, { status: 401 }),
    };
  }

  const admin = createAdminClient();
  const { data: bridgeId, error: bridgeError } = await admin
    .schema("simulador")
    .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

  if (bridgeError || !bridgeId) {
    console.error("[org-settings] ensure_bridge_user failed", bridgeError);
    return {
      response: NextResponse.json(
        { error: "No pudimos sincronizar tu cuenta." },
        { status: 500 },
      ),
    };
  }

  const { data: membership } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("organization_id, role")
    .eq("user_id", bridgeId)
    .eq("role", "org_admin")
    .limit(1)
    .maybeSingle();

  if (!membership?.organization_id) {
    return {
      response: NextResponse.json(
        { error: "Solo un org_admin puede editar la empresa." },
        { status: 403 },
      ),
    };
  }

  return {
    admin,
    organizationId: membership.organization_id as string,
    simuladorUserId: bridgeId as string,
  };
}

function serializeSettings(organization: JsonRecord, subscription: JsonRecord | null) {
  const metadata = asRecord(organization.metadata);
  const companyProfile = asRecord(metadata.company_profile);
  const filesLastChangedMonth = normalizeText(
    companyProfile.files_last_changed_month,
  );
  const thisMonth = currentMonthKey(new Date());

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      industry: organization.industry,
      region: organization.region,
      company_size_key: organization.company_size_key,
      updated_at: organization.updated_at,
      company_profile: {
        website_url: companyProfile.website_url ?? null,
        website_locked: Boolean(companyProfile.website_locked_at),
        website_locked_at: companyProfile.website_locked_at ?? null,
        files: Array.isArray(companyProfile.files) ? companyProfile.files : [],
        files_last_changed_at: companyProfile.files_last_changed_at ?? null,
        files_can_change_this_month: filesLastChangedMonth !== thisMonth,
      },
    },
    subscription,
    billing: {
      can_open_portal: Boolean(subscription?.stripe_customer_id),
      portal_return_path: "/empresa",
    },
  };
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as JsonRecord) }
    : {};
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWebsite(value: unknown) {
  const raw = normalizeText(value);
  if (!raw) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function normalizeCompanyFiles(files: CompanyFileInput[]) {
  if (files.length > 10) {
    return NextResponse.json(
      { error: "Máximo 10 archivos de contexto." },
      { status: 400 },
    );
  }

  const normalized = [];
  for (const file of files) {
    const name = normalizeText(file.name);
    const type = normalizeText(file.type);
    const size = Number(file.size);
    if (!name || !Number.isFinite(size) || size < 0) {
      return NextResponse.json({ error: "Archivo inválido." }, { status: 400 });
    }
    if (type !== "application/pdf" && !name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Solo se aceptan archivos PDF." },
        { status: 400 },
      );
    }

    normalized.push({
      id: normalizeText(file.id) || `${name}:${size}`,
      name,
      size,
      type: type || "application/pdf",
    });
  }

  return normalized;
}

function currentMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}
