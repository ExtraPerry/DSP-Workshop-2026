import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface MatchRequest {
  user_id: string;
  skill_id?: string;
  campus_id?: string;
}

interface MatchSuggestion {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  skill_id: string;
  skill_name: string;
  user_skill_level: number;
  match_score: number;
  shared_campus: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }).auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: MatchRequest = await req.json();
    const requestingUserId = body.user_id;

    const { data: currentUserRow } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!currentUserRow || currentUserRow.id !== requestingUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: mySkills } = await supabase
      .from("users_skills")
      .select("skill_id, user_skill_level")
      .eq("user_id", requestingUserId);

    const { data: myCampuses } = await supabase
      .from("users_campuses")
      .select("campus_id")
      .eq("user_id", requestingUserId);

    const myCampusIds = new Set(
      (myCampuses ?? []).map((c: { campus_id: string }) => c.campus_id)
    );

    let otherSkillsQuery = supabase
      .from("users_skills")
      .select("user_id, skill_id, user_skill_level")
      .neq("user_id", requestingUserId);

    if (body.skill_id) {
      otherSkillsQuery = otherSkillsQuery.eq("skill_id", body.skill_id);
    }

    const { data: otherSkills } = await otherSkillsQuery;

    if (!otherSkills || !mySkills) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mySkillMap = new Map(
      mySkills.map((s: { skill_id: string; user_skill_level: number }) => [
        s.skill_id,
        s.user_skill_level,
      ])
    );

    const userScores = new Map<string, MatchSuggestion>();

    for (const otherSkill of otherSkills) {
      const myLevel = mySkillMap.get(otherSkill.skill_id);
      if (myLevel === undefined) continue;

      const otherLevel = otherSkill.user_skill_level;
      const levelDiff = Math.abs(otherLevel - myLevel);

      const isComplementary =
        (myLevel <= 2 && otherLevel >= 4) || (myLevel >= 4 && otherLevel <= 2);

      if (!isComplementary) continue;

      const matchScore = levelDiff * 10;

      const existingEntry = userScores.get(otherSkill.user_id);
      if (!existingEntry || existingEntry.match_score < matchScore) {
        userScores.set(otherSkill.user_id, {
          user_id: otherSkill.user_id,
          first_name: null,
          last_name: null,
          skill_id: otherSkill.skill_id,
          skill_name: "",
          user_skill_level: otherSkill.user_skill_level,
          match_score: matchScore,
          shared_campus: false,
        });
      }
    }

    const candidateUserIds = Array.from(userScores.keys());
    if (candidateUserIds.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: candidateUsers } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .in("id", candidateUserIds);

    const { data: candidateCampuses } = await supabase
      .from("users_campuses")
      .select("user_id, campus_id")
      .in("user_id", candidateUserIds);

    const { data: skillRows } = await supabase
      .from("skills")
      .select("id, name_fr, name_en");

    const skillNameMap = new Map(
      (skillRows ?? []).map((s: { id: string; name_fr: string }) => [
        s.id,
        s.name_fr,
      ])
    );

    if (body.campus_id) {
      for (const [userId, suggestion] of userScores) {
        const hasCampus = (candidateCampuses ?? []).some(
          (c: { user_id: string; campus_id: string }) =>
            c.user_id === userId && c.campus_id === body.campus_id
        );
        if (!hasCampus) {
          userScores.delete(userId);
        } else {
          suggestion.shared_campus = true;
        }
      }
    } else {
      for (const [userId, suggestion] of userScores) {
        const campuses = (candidateCampuses ?? []).filter(
          (c: { user_id: string; campus_id: string }) => c.user_id === userId
        );
        suggestion.shared_campus = campuses.some(
          (c: { campus_id: string }) => myCampusIds.has(c.campus_id)
        );
        if (suggestion.shared_campus) {
          suggestion.match_score += 20;
        }
      }
    }

    for (const [userId, suggestion] of userScores) {
      const userRow = (candidateUsers ?? []).find(
        (u: { id: string }) => u.id === userId
      );
      if (userRow) {
        suggestion.first_name = userRow.first_name;
        suggestion.last_name = userRow.last_name;
      }
      suggestion.skill_name = skillNameMap.get(suggestion.skill_id) ?? "";
    }

    const suggestions = Array.from(userScores.values())
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
