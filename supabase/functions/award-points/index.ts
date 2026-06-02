import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface AwardPointsRequest {
  user_id: string;
  action_key: string;
  reference_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AwardPointsRequest = await req.json();
    const { user_id, action_key, reference_id } = body;

    const { data: pointAction, error: actionError } = await supabase
      .from("point_actions")
      .select("*")
      .eq("action_key", action_key)
      .single();

    if (actionError || !pointAction) {
      return new Response(
        JSON.stringify({ error: `Unknown action_key: ${action_key}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: ledgerError } = await supabase
      .from("user_points_ledger")
      .insert({
        user_id,
        point_action_id: pointAction.id,
        points_earned: pointAction.points_value,
        reference_id: reference_id ?? null,
      });

    if (ledgerError) {
      return new Response(
        JSON.stringify({ error: ledgerError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: totalData } = await supabase
      .from("user_points_ledger")
      .select("points_earned")
      .eq("user_id", user_id);

    const totalPoints = (totalData ?? []).reduce(
      (sum: number, row: { points_earned: number }) => sum + row.points_earned,
      0
    );

    const checkBadgeResponse = await fetch(
      `${supabaseUrl}/functions/v1/check-badge-criteria`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ user_id }),
      }
    );

    const badgeResult = await checkBadgeResponse.json();

    const { data: userChallenges } = await supabase
      .from("user_challenges")
      .select("*, challenge:challenges(*)")
      .eq("user_id", user_id)
      .eq("status", "IN_PROGRESS");

    const completedChallenges: string[] = [];

    for (const userChallenge of userChallenges ?? []) {
      const challenge = userChallenge.challenge;
      if (challenge && challenge.goal_type === action_key) {
        const newProgress = userChallenge.current_progress + 1;
        const isComplete = newProgress >= challenge.goal_count;

        await supabase
          .from("user_challenges")
          .update({
            current_progress: newProgress,
            ...(isComplete
              ? { status: "COMPLETED", completed_at: new Date().toISOString() }
              : {}),
          })
          .eq("id", userChallenge.id);

        if (isComplete) {
          completedChallenges.push(challenge.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        points_earned: pointAction.points_value,
        total_points: totalPoints,
        badges_awarded: badgeResult.newly_awarded_badges ?? [],
        challenges_completed: completedChallenges,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
