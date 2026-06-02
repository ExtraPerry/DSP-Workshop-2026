"use client";

import { useTranslations } from "next-intl";
import { useSkills, useCourses, useCampuses, useAcademicLevels } from "@/hooks/use-lookups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLookupsPage() {
  const t = useTranslations("Pages.AdminLookupsPage");
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: campuses, isLoading: campusesLoading } = useCampuses();
  const { data: academicLevels, isLoading: levelsLoading } = useAcademicLevels();

  const isLoading = skillsLoading || coursesLoading || campusesLoading || levelsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  function renderLookupTable(items: { id: string; name_fr: string; name_en: string | null }[] | undefined) {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground">{t("no_items")}</p>;
    }
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <span className="font-medium">{item.name_fr}</span>
              {item.name_en && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({item.name_en})
                </span>
              )}
            </div>
          </div>
        ))}
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
          <TabsTrigger value="academic_levels">{t("academic_levels")}</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>{t("skills")}</CardTitle>
            </CardHeader>
            <CardContent>{renderLookupTable(skills)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>{t("courses")}</CardTitle>
            </CardHeader>
            <CardContent>{renderLookupTable(courses)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campuses">
          <Card>
            <CardHeader>
              <CardTitle>{t("campuses")}</CardTitle>
            </CardHeader>
            <CardContent>{renderLookupTable(campuses)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic_levels">
          <Card>
            <CardHeader>
              <CardTitle>{t("academic_levels")}</CardTitle>
            </CardHeader>
            <CardContent>{renderLookupTable(academicLevels)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
