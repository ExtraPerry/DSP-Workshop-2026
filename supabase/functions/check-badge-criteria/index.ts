import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface CheckBadgeRequest {
  user_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CheckBadgeRequest = await req.json();
    const { user_id } = body;

    const { data: allBadges } = await supabase
      .from("badges")
      .select("*");

    const { data: earnedBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user_id);

    const earnedBadgeIds = new Set(
      (earnedBadges ?? []).map((b: { badge_id: string }) => b.badge_id)
    );

    const { data: totalPointsData } = await supabase
      .from("user_points_ledger")
      .select("points_earned")
      .eq("user_id", user_id);

    const totalPoints = (totalPointsData ?? []).reduce(
      (sum: number, row: { points_earned: number }) => sum + row.points_earned,
      0
    );

    const { data: sessionsCompleted } = await supabase
      .from("session_participants")
      .select("id")
      .eq("user_id", user_id);

    const sessionCount = sessionsCompleted?.length ?? 0;

    const newlyAwarded: string[] = [];

    for (const badge of allBadges ?? []) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      if (badge.criteria_description?.includes("points:")) {
        const threshold = parseInt(
          badge.criteria_description.split("points:")[1]
        );
        if (totalPoints >= threshold) shouldAward = true;
      } else if (badge.criteria_description?.includes("sessions:")) {
        const threshold = parseInt(
          badge.criteria_description.split("sessions:")[1]
        );
        if (sessionCount >= threshold) shouldAward = true;
      }

      if (shouldAward) {
        await supabase.from("user_badges").insert({
          user_id,
          badge_id: badge.id,
        });
        newlyAwarded.push(badge.id);
      }
    }

    return new Response(
      JSON.stringify({ newly_awarded_badges: newlyAwarded }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
