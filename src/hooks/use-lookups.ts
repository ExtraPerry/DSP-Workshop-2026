"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import type { Tables } from "@/lib/supabase/database.types";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";

export const SKILLS_QUERY_KEY = ["skills"] as const;
export const COURSES_QUERY_KEY = ["courses"] as const;
export const CAMPUSES_QUERY_KEY = ["campuses"] as const;
export const ACADEMIC_LEVELS_QUERY_KEY = ["academicLevels"] as const;
export const SESSION_TYPES_QUERY_KEY = ["sessionTypes"] as const;

type ProposableLookupTable = "skills" | "courses" | "campuses";

type ProposableLookupRow = Tables<ProposableLookupTable>;

const PROPOSABLE_LOOKUP_QUERY_KEYS: Record<
  ProposableLookupTable,
  typeof SKILLS_QUERY_KEY | typeof COURSES_QUERY_KEY | typeof CAMPUSES_QUERY_KEY
> = {
  skills: SKILLS_QUERY_KEY,
  courses: COURSES_QUERY_KEY,
  campuses: CAMPUSES_QUERY_KEY,
};

async function fetchLookupRows<TableName extends string>(tableName: TableName) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from(tableName as never)
    .select("*")
    .order("name_fr", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Proposes a new user-created lookup row (skill/course/campus). The row is
 * inserted unverified and tied to its creator; an admin verifies it later.
 */
async function proposeLookupRow(
  tableName: ProposableLookupTable,
  name: string,
  createdByUserId: string
): Promise<ProposableLookupRow> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from(tableName)
    .insert({
      name_fr: name,
      created_by_user_id: createdByUserId,
      is_verified: false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

function upsertLookupRowInCache(
  queryClient: QueryClient,
  queryKey: QueryKey,
  row: ProposableLookupRow
) {
  queryClient.setQueryData<ProposableLookupRow[]>(queryKey, (old) => {
    const list = old ?? [];
    if (list.some((item) => item.id === row.id)) return list;
    return [...list, row].sort((a, b) => a.name_fr.localeCompare(b.name_fr));
  });
}

export function useProposeLookup(table: ProposableLookupTable) {
  const queryClient = useQueryClient();
  const queryKey = PROPOSABLE_LOOKUP_QUERY_KEYS[table];

  return useMutation({
    mutationFn: ({
      name,
      createdByUserId,
    }: {
      name: string;
      createdByUserId: string;
    }) => proposeLookupRow(table, name, createdByUserId),
    onSuccess: (row) => {
      upsertLookupRowInCache(queryClient, queryKey, row);
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useProposeSkill() {
  return useProposeLookup("skills");
}

export function useProposeCourse() {
  return useProposeLookup("courses");
}

export function useProposeCampus() {
  return useProposeLookup("campuses");
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

export function useSessionTypes() {
  return useRealtimeQuery<Tables<"session_types">[]>({
    queryKey: SESSION_TYPES_QUERY_KEY,
    queryFn: () =>
      fetchLookupRows("session_types") as Promise<Tables<"session_types">[]>,
    realtimeSubscriptions: [{ table: "session_types" }],
  });
}
