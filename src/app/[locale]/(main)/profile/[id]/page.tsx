"use client";

import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getLocalizedName } from "@/lib/localized-name";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, UserPlus, Calendar, BookOpen, MapPin, Star } from "lucide-react";

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return first + last || "?";
}

export default function ProfilePage() {
  const t = useTranslations("Pages.ProfilePage");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const { data: profile, isLoading } = useUserProfile(params.id);
  const { data: currentUser } = useCurrentUser();

  const isOwnProfile = currentUser?.id === params.id;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">{t("not_found")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">
              {getInitials(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.email && (
              <p className="text-muted-foreground">{profile.email}</p>
            )}
            {profile.academic_level && (
              <Badge variant="secondary" className="mt-2">
                {getLocalizedName(profile.academic_level, locale)}
              </Badge>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {t("member_since")}{" "}
              {new Date(profile.created_at).toLocaleDateString(locale)}
            </p>
          </div>
          {isOwnProfile && (
            <Button asChild variant="outline">
              <Link href="/profile/edit">
                <Pencil className="mr-2 size-4" />
                {t("edit_profile")}
              </Link>
            </Button>
          )}
          {!isOwnProfile && currentUser && (
            <Button variant="outline">
              <UserPlus className="mr-2 size-4" />
              {t("add_friend")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills">
            <Star className="mr-1 size-4" />
            {t("skills")}
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="mr-1 size-4" />
            {t("courses")}
          </TabsTrigger>
          <TabsTrigger value="campuses">
            <MapPin className="mr-1 size-4" />
            {t("campuses")}
          </TabsTrigger>
          <TabsTrigger value="availabilities">
            <Calendar className="mr-1 size-4" />
            {t("availabilities")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>{t("skills")}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.users_skills.length === 0 ? (
                <p className="text-muted-foreground">{t("no_skills")}</p>
              ) : (
                <div className="space-y-3">
                  {profile.users_skills.map((userSkill) => (
                    <div
                      key={userSkill.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <span className="font-medium">
                          {getLocalizedName(userSkill.skill, locale)}
                        </span>
                        {userSkill.user_skill_description && (
                          <p className="text-sm text-muted-foreground">
                            {userSkill.user_skill_description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {t("skill_level")}: {userSkill.user_skill_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>{t("courses")}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.users_courses.length === 0 ? (
                <p className="text-muted-foreground">{t("no_courses")}</p>
              ) : (
                <div className="space-y-3">
                  {profile.users_courses.map((userCourse) => (
                    <div
                      key={userCourse.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <span className="font-medium">
                        {getLocalizedName(userCourse.course, locale)}
                      </span>
                      {userCourse.start_date && (
                        <span className="text-sm text-muted-foreground">
                          {userCourse.start_date} — {userCourse.end_date ?? "..."}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campuses">
          <Card>
            <CardHeader>
              <CardTitle>{t("campuses")}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.users_campuses.length === 0 ? (
                <p className="text-muted-foreground">{t("no_campuses")}</p>
              ) : (
                <div className="space-y-3">
                  {profile.users_campuses.map((userCampus) => (
                    <div
                      key={userCampus.id}
                      className="rounded-md border p-3"
                    >
                      <span className="font-medium">
                        {getLocalizedName(userCampus.campus, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availabilities">
          <Card>
            <CardHeader>
              <CardTitle>{t("availabilities")}</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.users_availabilities.length === 0 ? (
                <p className="text-muted-foreground">{t("no_availabilities")}</p>
              ) : (
                <div className="space-y-3">
                  {profile.users_availabilities.map((availability) => (
                    <div
                      key={availability.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <span className="text-sm">
                          {new Date(availability.start_timestamp).toLocaleString(locale)} —{" "}
                          {new Date(availability.end_timestamp).toLocaleString(locale)}
                        </span>
                      </div>
                      {availability.recurring_days && availability.recurring_days.length > 0 && (
                        <div className="flex gap-1">
                          {availability.recurring_days.map((day) => (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {day.slice(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
