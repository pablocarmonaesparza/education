/**
 * GET /api/admin/orgs
 *
 * Vista staff de operación por organización: sprints, seats, sesiones,
 * reportes y estado de billing. No reemplaza el dashboard del manager; es la
 * consola interna para saber dónde intervenir sin entrar a Supabase.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

type OrganizationRow = {
  id: string;
  name: string;
  industry: string | null;
  region: string | null;
  company_size_key: string | null;
  created_at: string;
};

type TeamRow = {
  id: string;
  organization_id: string;
  name: string;
  department_key: string | null;
};

type MembershipRow = {
  organization_id?: string;
  team_id?: string;
  user_id: string;
  role: string;
};

type SprintRow = {
  id: string;
  organization_id: string;
  team_id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

type SubscriptionRow = {
  organization_id: string;
  tier: string;
  status: string;
  seats: number;
  price_usd_total: number | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
};

type SessionRow = {
  id: string;
  sprint_id: string | null;
  status: string;
  completed_at: string | null;
  started_at: string;
};

type ReportRow = {
  sprint_id: string;
  status: string;
  generated_at: string;
};

export async function GET(req: NextRequest) {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "100") || 100, 1),
    200,
  );

  const admin = createAdminClient();
  const { data: orgs, error: orgError } = await admin
    .schema("simulador")
    .from("organizations")
    .select("id, name, industry, region, company_size_key, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (orgError) {
    console.error("[admin/orgs] org list failed", orgError);
    return NextResponse.json(
      { error: "Could not list organizations." },
      { status: 500 },
    );
  }

  const organizations = (orgs ?? []) as OrganizationRow[];
  const orgIds = organizations.map((org) => org.id);
  if (orgIds.length === 0) {
    return NextResponse.json({ items: [], summary: emptySummary() });
  }

  const [
    { data: teams },
    { data: orgMemberships },
    { data: sprints },
    { data: subscriptions },
  ] = await Promise.all([
    admin
      .schema("simulador")
      .from("teams")
      .select("id, organization_id, name, department_key")
      .in("organization_id", orgIds),
    admin
      .schema("simulador")
      .from("organization_memberships")
      .select("organization_id, user_id, role")
      .in("organization_id", orgIds),
    admin
      .schema("simulador")
      .from("sprints")
      .select("id, organization_id, team_id, name, status, start_date, end_date, created_at")
      .in("organization_id", orgIds),
    admin
      .schema("simulador")
      .from("subscriptions")
      .select(
        "organization_id, tier, status, seats, price_usd_total, current_period_end, stripe_customer_id, created_at",
      )
      .in("organization_id", orgIds),
  ]);

  const teamRows = (teams ?? []) as TeamRow[];
  const teamIds = teamRows.map((team) => team.id);
  const { data: teamMemberships } =
    teamIds.length > 0
      ? await admin
          .schema("simulador")
          .from("team_memberships")
          .select("team_id, user_id, role")
          .in("team_id", teamIds)
      : { data: [] };

  const sprintRows = (sprints ?? []) as SprintRow[];
  const sprintIds = sprintRows.map((sprint) => sprint.id);

  const [{ data: sessions }, { data: reports }] =
    sprintIds.length > 0
      ? await Promise.all([
          admin
            .schema("simulador")
            .from("simulation_sessions")
            .select("id, sprint_id, status, completed_at, started_at")
            .in("sprint_id", sprintIds),
          admin
            .schema("simulador")
            .from("reports")
            .select("sprint_id, status, generated_at")
            .in("sprint_id", sprintIds),
        ])
      : [{ data: [] }, { data: [] }];

  const teamsByOrg = groupBy(teamRows, "organization_id");
  const orgMembersByOrg = groupBy(
    (orgMemberships ?? []) as MembershipRow[],
    "organization_id",
  );
  const teamMembershipRows = (teamMemberships ?? []) as MembershipRow[];
  const teamOrgById = new Map(teamRows.map((team) => [team.id, team.organization_id]));
  const teamMembersByOrg = new Map<string, MembershipRow[]>();
  for (const member of teamMembershipRows) {
    if (!member.team_id) continue;
    const organizationId = teamOrgById.get(member.team_id);
    if (!organizationId) continue;
    const current = teamMembersByOrg.get(organizationId) ?? [];
    current.push(member);
    teamMembersByOrg.set(organizationId, current);
  }
  const sprintsByOrg = groupBy(sprintRows, "organization_id");
  const subscriptionsByOrg = groupBy(
    (subscriptions ?? []) as SubscriptionRow[],
    "organization_id",
  );
  const sessionsBySprint = groupBy((sessions ?? []) as SessionRow[], "sprint_id");
  const reportsBySprint = groupBy((reports ?? []) as ReportRow[], "sprint_id");

  const items = organizations.map((org) => {
    const orgTeams = teamsByOrg.get(org.id) ?? [];
    const uniqueUsers = new Set<string>();
    for (const member of orgMembersByOrg.get(org.id) ?? []) {
      uniqueUsers.add(member.user_id);
    }
    for (const member of teamMembersByOrg.get(org.id) ?? []) {
      uniqueUsers.add(member.user_id);
    }

    const orgSprints = sprintsByOrg.get(org.id) ?? [];
    const orgSessions = orgSprints.flatMap(
      (sprint) => sessionsBySprint.get(sprint.id) ?? [],
    );
    const orgReports = orgSprints.flatMap(
      (sprint) => reportsBySprint.get(sprint.id) ?? [],
    );
    const latestSubscription =
      (subscriptionsByOrg.get(org.id) ?? []).sort((a, b) => {
        const activeDelta = Number(b.status === "active") - Number(a.status === "active");
        if (activeDelta !== 0) return activeDelta;
        return String(b.current_period_end ?? b.created_at).localeCompare(
          String(a.current_period_end ?? a.created_at),
        );
      })[0] ?? null;

    return {
      ...org,
      teams: orgTeams,
      counts: {
        teams: orgTeams.length,
        members: uniqueUsers.size,
        sprints: orgSprints.length,
        active_sprints: orgSprints.filter((sprint) => sprint.status === "active")
          .length,
        sessions: orgSessions.length,
        completed_sessions: orgSessions.filter((session) =>
          ["submitted", "evaluated", "completed", "published"].includes(
            session.status,
          ),
        ).length,
        reports: orgReports.length,
      },
      latest_sprint: orgSprints.sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      )[0] ?? null,
      subscription: latestSubscription,
    };
  });

  return NextResponse.json({
    items,
    summary: {
      organizations: items.length,
      active_sprints: items.reduce(
        (sum, item) => sum + item.counts.active_sprints,
        0,
      ),
      seats: items.reduce(
        (sum, item) => sum + (item.subscription?.seats ?? item.counts.members),
        0,
      ),
      reports: items.reduce((sum, item) => sum + item.counts.reports, 0),
    },
  });
}

function groupBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const value = row[key];
    if (typeof value !== "string") continue;
    const current = map.get(value) ?? [];
    current.push(row);
    map.set(value, current);
  }
  return map;
}

function emptySummary() {
  return {
    organizations: 0,
    active_sprints: 0,
    seats: 0,
    reports: 0,
  };
}
