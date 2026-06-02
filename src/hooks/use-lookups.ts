"use client";

import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Tables } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export const SKILLS_QUERY_KEY = ["skills"] as const;
export const COURSES_QUERY_KEY = ["courses"] as const;
export const CAMPUSES_QUERY_KEY = ["campuses"] as const;
export const ACADEMIC_LEVELS_QUERY_KEY = ["academicLevels"] as const;

async function fetchLookupRows<TableName extends string>(tableName: TableName) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from(tableName as never)
    .select("*")
    .order("name_fr", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function useSkills() {
  return useRealtimeQuery<Tables<"skills">[]>({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: () => fetchLookupRows("skills") as Promise<Tables<"skills">[]>,
    realtimeSubscriptions: [{ table: "skills" }],
  });
}

export function useCourses() {
  return useRealtimeQuery<Tables<"courses">[]>({
    queryKey: COURSES_QUERY_KEY,
    queryFn: () => fetchLookupRows("courses") as Promise<Tables<"courses">[]>,
    realtimeSubscriptions: [{ table: "courses" }],
  });
}

export function useCampuses() {
  return useRealtimeQuery<Tables<"campuses">[]>({
    queryKey: CAMPUSES_QUERY_KEY,
    queryFn: () => fetchLookupRows("campuses") as Promise<Tables<"campuses">[]>,
    realtimeSubscriptions: [{ table: "campuses" }],
  });
}

export function useAcademicLevels() {
  return useRealtimeQuery<Tables<"academic_levels">[]>({
    queryKey: ACADEMIC_LEVELS_QUERY_KEY,
    queryFn: () =>
      fetchLookupRows("academic_levels") as Promise<
        Tables<"academic_levels">[]
      >,
    realtimeSubscriptions: [{ table: "academic_levels" }],
  });
}
