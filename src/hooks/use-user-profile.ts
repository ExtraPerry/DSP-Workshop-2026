"use client";

import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Tables } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export type UserSkillWithSkill = Tables<"users_skills"> & {
  skill: Tables<"skills"> | null;
};

export type UserCourseWithCourse = Tables<"users_courses"> & {
  course: Tables<"courses"> | null;
};

export type UserCampusWithCampus = Tables<"users_campuses"> & {
  campus: Tables<"campuses"> | null;
};

export type UserProfile = Tables<"users"> & {
  academic_level: Tables<"academic_levels"> | null;
  users_skills: UserSkillWithSkill[];
  users_courses: UserCourseWithCourse[];
  users_campuses: UserCampusWithCampus[];
  users_availabilities: Tables<"users_availabilities">[];
};

const USER_PROFILE_SELECT = `
  *,
  academic_level:academic_levels(*),
  users_skills(*, skill:skills(*)),
  users_courses(*, course:courses(*)),
  users_campuses(*, campus:campuses(*)),
  users_availabilities(*)
`;

export function userProfileQueryKey(userId: string | undefined) {
  return ["userProfile", userId ?? null] as const;
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("users")
    .select(USER_PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserProfile | null) ?? null;
}

export function useUserProfile(userId: string | undefined) {
  return useRealtimeQuery<UserProfile | null>({
    queryKey: userProfileQueryKey(userId),
    queryFn: () => fetchUserProfile(userId as string),
    enabled: Boolean(userId),
    realtimeSubscriptions: userId
      ? [
          { table: "users", filter: `id=eq.${userId}` },
          { table: "users_skills", filter: `user_id=eq.${userId}` },
          { table: "users_courses", filter: `user_id=eq.${userId}` },
          { table: "users_campuses", filter: `user_id=eq.${userId}` },
          { table: "users_availabilities", filter: `user_id=eq.${userId}` },
        ]
      : [],
  });
}
