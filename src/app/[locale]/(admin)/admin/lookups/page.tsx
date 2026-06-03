"use client";

import { useTranslations } from "next-intl";
import {
  useSkills,
  useCourses,
  useCampuses,
  useAcademicLevels,
  useSessionTypes,
  SKILLS_QUERY_KEY,
  COURSES_QUERY_KEY,
  CAMPUSES_QUERY_KEY,
  ACADEMIC_LEVELS_QUERY_KEY,
  SESSION_TYPES_QUERY_KEY,
} from "@/hooks/use-lookups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LookupTableManager } from "@/components/admin/lookup-table-manager";

export default function AdminLookupsPage() {
  const t = useTranslations("Pages.AdminLookupsPage");
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: campuses, isLoading: campusesLoading } = useCampuses();
  const { data: academicLevels, isLoading: levelsLoading } = useAcademicLevels();
  const { data: sessionTypes, isLoading: typesLoading } = useSessionTypes();

  const isLoading =
    skillsLoading ||
    coursesLoading ||
    campusesLoading ||
    levelsLoading ||
    typesLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">{t("skills")}</TabsTrigger>
          <TabsTrigger value="courses">{t("courses")}</TabsTrigger>
          <TabsTrigger value="campuses">{t("campuses")}</TabsTrigger>
          <TabsTrigger value="academic_levels">
            {t("academic_levels")}
          </TabsTrigger>
          <TabsTrigger value="session_types">{t("session_types")}</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>{t("skills")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LookupTableManager
                tableName="skills"
                items={skills}
                queryKey={SKILLS_QUERY_KEY}
                supportsVerification
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>{t("courses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LookupTableManager
                tableName="courses"
                items={courses}
                queryKey={COURSES_QUERY_KEY}
                supportsVerification
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campuses">
          <Card>
            <CardHeader>
              <CardTitle>{t("campuses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LookupTableManager
                tableName="campuses"
                items={campuses}
                queryKey={CAMPUSES_QUERY_KEY}
                supportsVerification
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic_levels">
          <Card>
            <CardHeader>
              <CardTitle>{t("academic_levels")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LookupTableManager
                tableName="academic_levels"
                items={academicLevels}
                queryKey={ACADEMIC_LEVELS_QUERY_KEY}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session_types">
          <Card>
            <CardHeader>
              <CardTitle>{t("session_types")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LookupTableManager
                tableName="session_types"
                items={sessionTypes}
                queryKey={SESSION_TYPES_QUERY_KEY}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
