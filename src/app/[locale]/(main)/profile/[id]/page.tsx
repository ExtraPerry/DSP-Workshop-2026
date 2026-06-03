"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserProfile, userProfileQueryKey } from "@/hooks/use-user-profile";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useFriendships, friendshipsQueryKey } from "@/hooks/use-friendships";
import {
  useSkills,
  useCourses,
  useCampuses,
  useProposeSkill,
  useProposeCourse,
  useProposeCampus,
} from "@/hooks/use-lookups";
import { sendFriendRequest } from "@/lib/friendships/send-friend-request";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Constants } from "@/lib/supabase/database.types";
import type { Enums } from "@/lib/supabase/database.types";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LookupCombobox } from "@/components/lookup-combobox";
import { DateTimePicker } from "@/components/date-time-picker";
import {
  Pencil,
  UserPlus,
  Calendar,
  BookOpen,
  MapPin,
  Star,
  Trash2,
  Plus,
} from "lucide-react";

const WEEK_DAYS = Constants.public.Enums.week_day_type;

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return first + last || "?";
}

export default function ProfilePage() {
  const t = useTranslations("Pages.ProfilePage");
  const weekdayLabels = useTranslations("Components.Weekdays");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile(params.id);
  const { data: currentUser } = useCurrentUser();
  const { data: friendships } = useFriendships(currentUser?.id);

  const { data: skills } = useSkills();
  const { data: courses } = useCourses();
  const { data: campuses } = useCampuses();
  const proposeSkill = useProposeSkill();
  const proposeCourse = useProposeCourse();
  const proposeCampus = useProposeCampus();

  const isOwnProfile = currentUser?.id === params.id;

  const [newSkillId, setNewSkillId] = useState<string | null>(null);
  const [newSkillLevel, setNewSkillLevel] = useState("5");
  const [newSkillDescription, setNewSkillDescription] = useState("");

  const [newCourseId, setNewCourseId] = useState<string | null>(null);
  const [newCourseStart, setNewCourseStart] = useState("");
  const [newCourseEnd, setNewCourseEnd] = useState("");

  const [newCampusId, setNewCampusId] = useState<string | null>(null);

  const [newAvailabilityStart, setNewAvailabilityStart] = useState("");
  const [newAvailabilityEnd, setNewAvailabilityEnd] = useState("");
  const [newRecurringDays, setNewRecurringDays] = useState<
    Enums<"week_day_type">[]
  >([]);

  function refreshProfile() {
    queryClient.invalidateQueries({ queryKey: userProfileQueryKey(params.id) });
  }

  async function handleAddSkill() {
    if (!currentUser || !newSkillId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("users_skills").insert({
      user_id: currentUser.id,
      skill_id: newSkillId,
      user_skill_level: Number(newSkillLevel) || 0,
      user_skill_description: newSkillDescription || null,
    });
    if (error) {
      toast.error(t("add_error"));
      return;
    }
    setNewSkillId(null);
    setNewSkillLevel("5");
    setNewSkillDescription("");
    refreshProfile();
  }

  async function handleAddCourse() {
    if (!currentUser || !newCourseId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("users_courses").insert({
      user_id: currentUser.id,
      class_id: newCourseId,
      start_date: newCourseStart || null,
      end_date: newCourseEnd || null,
    });
    if (error) {
      toast.error(t("add_error"));
      return;
    }
    setNewCourseId(null);
    setNewCourseStart("");
    setNewCourseEnd("");
    refreshProfile();
  }

  async function handleAddCampus() {
    if (!currentUser || !newCampusId) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("users_campuses").insert({
      user_id: currentUser.id,
      campus_id: newCampusId,
    });
    if (error) {
      toast.error(t("add_error"));
      return;
    }
    setNewCampusId(null);
    refreshProfile();
  }

  async function handleAddAvailability() {
    if (!currentUser || !newAvailabilityStart || !newAvailabilityEnd) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("users_availabilities").insert({
      user_id: currentUser.id,
      start_timestamp: newAvailabilityStart,
      end_timestamp: newAvailabilityEnd,
      recurring_days: newRecurringDays.length > 0 ? newRecurringDays : null,
    });
    if (error) {
      toast.error(t("add_error"));
      return;
    }
    setNewAvailabilityStart("");
    setNewAvailabilityEnd("");
    setNewRecurringDays([]);
    refreshProfile();
  }

  async function handleRemoveRow(
    tableName: "users_skills" | "users_courses" | "users_campuses" | "users_availabilities",
    rowId: string
  ) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from(tableName).delete().eq("id", rowId);
    if (error) {
      toast.error(t("add_error"));
      return;
    }
    refreshProfile();
  }

  function toggleRecurringDay(day: Enums<"week_day_type">) {
    setNewRecurringDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  }

  async function handleSendFriendRequest() {
    if (!currentUser) return;
    try {
      await sendFriendRequest(currentUser.id, params.id);
      toast.success(t("request_sent"));
      queryClient.invalidateQueries({
        queryKey: friendshipsQueryKey(currentUser.id),
      });
    } catch {
      toast.error(t("add_error"));
    }
  }

  const isAlreadyFriend = friendships?.friends.some(
    (pair) =>
      pair.requestor_user_id === params.id ||
      pair.receiver_user_id === params.id
  );
  const hasOutgoingRequest = friendships?.outgoingRequests.some(
    (request) => request.receiver_user_id === params.id
  );

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
        <CardContent className="flex items-start gap-6 pt-6">
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
            <div className="mt-3">
              <p className="text-sm font-medium">{t("bio")}</p>
              <p className="text-sm text-muted-foreground">
                {profile.bio || t("no_bio")}
              </p>
            </div>
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
            <Button
              variant="outline"
              onClick={handleSendFriendRequest}
              disabled={isAlreadyFriend || hasOutgoingRequest}
            >
              <UserPlus className="mr-2 size-4" />
              {isAlreadyFriend
                ? t("friends")
                : hasOutgoingRequest
                  ? t("pending_request")
                  : t("add_friend")}
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
            <CardContent className="space-y-3">
              {profile.users_skills.length === 0 ? (
                <p className="text-muted-foreground">{t("no_skills")}</p>
              ) : (
                profile.users_skills.map((userSkill) => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {t("skill_level")}: {userSkill.user_skill_level}
                      </Badge>
                      {isOwnProfile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveRow("users_skills", userSkill.id)
                          }
                          aria-label={t("remove")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isOwnProfile && (
                <div className="space-y-3 rounded-md border border-dashed p-3">
                  <LookupCombobox
                    items={skills ?? []}
                    value={newSkillId}
                    onChange={setNewSkillId}
                    allowClear={false}
                    allowCreate
                    onCreate={async (name) => {
                      const row = await proposeSkill.mutateAsync({
                        name,
                        createdByUserId: currentUser!.id,
                      });
                      return row.id;
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={newSkillLevel}
                      onChange={(event) => setNewSkillLevel(event.target.value)}
                      className="w-24"
                      aria-label={t("skill_level")}
                    />
                    <Input
                      value={newSkillDescription}
                      onChange={(event) =>
                        setNewSkillDescription(event.target.value)
                      }
                      placeholder={t("skill_description")}
                    />
                  </div>
                  <Button onClick={handleAddSkill} disabled={!newSkillId}>
                    <Plus className="mr-1 size-4" />
                    {t("add_skill")}
                  </Button>
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
            <CardContent className="space-y-3">
              {profile.users_courses.length === 0 ? (
                <p className="text-muted-foreground">{t("no_courses")}</p>
              ) : (
                profile.users_courses.map((userCourse) => (
                  <div
                    key={userCourse.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="font-medium">
                      {getLocalizedName(userCourse.course, locale)}
                    </span>
                    <div className="flex items-center gap-2">
                      {userCourse.start_date && (
                        <span className="text-sm text-muted-foreground">
                          {userCourse.start_date} — {userCourse.end_date ?? "..."}
                        </span>
                      )}
                      {isOwnProfile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveRow("users_courses", userCourse.id)
                          }
                          aria-label={t("remove")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isOwnProfile && (
                <div className="space-y-3 rounded-md border border-dashed p-3">
                  <LookupCombobox
                    items={courses ?? []}
                    value={newCourseId}
                    onChange={setNewCourseId}
                    allowClear={false}
                    allowCreate
                    onCreate={async (name) => {
                      const row = await proposeCourse.mutateAsync({
                        name,
                        createdByUserId: currentUser!.id,
                      });
                      return row.id;
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newCourseStart}
                      onChange={(event) => setNewCourseStart(event.target.value)}
                      aria-label={t("start")}
                    />
                    <Input
                      type="date"
                      value={newCourseEnd}
                      onChange={(event) => setNewCourseEnd(event.target.value)}
                      aria-label={t("end")}
                    />
                  </div>
                  <Button onClick={handleAddCourse} disabled={!newCourseId}>
                    <Plus className="mr-1 size-4" />
                    {t("add_course")}
                  </Button>
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
            <CardContent className="space-y-3">
              {profile.users_campuses.length === 0 ? (
                <p className="text-muted-foreground">{t("no_campuses")}</p>
              ) : (
                profile.users_campuses.map((userCampus) => (
                  <div
                    key={userCampus.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="font-medium">
                      {getLocalizedName(userCampus.campus, locale)}
                    </span>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveRow("users_campuses", userCampus.id)
                        }
                        aria-label={t("remove")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}

              {isOwnProfile && (
                <div className="space-y-3 rounded-md border border-dashed p-3">
                  <LookupCombobox
                    items={campuses ?? []}
                    value={newCampusId}
                    onChange={setNewCampusId}
                    allowClear={false}
                    allowCreate
                    onCreate={async (name) => {
                      const row = await proposeCampus.mutateAsync({
                        name,
                        createdByUserId: currentUser!.id,
                      });
                      return row.id;
                    }}
                  />
                  <Button onClick={handleAddCampus} disabled={!newCampusId}>
                    <Plus className="mr-1 size-4" />
                    {t("add_campus")}
                  </Button>
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
            <CardContent className="space-y-3">
              {profile.users_availabilities.length === 0 ? (
                <p className="text-muted-foreground">{t("no_availabilities")}</p>
              ) : (
                profile.users_availabilities.map((availability) => (
                  <div
                    key={availability.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <span className="text-sm">
                        {new Date(availability.start_timestamp).toLocaleString(locale)} —{" "}
                        {new Date(availability.end_timestamp).toLocaleString(locale)}
                      </span>
                      {availability.recurring_days &&
                        availability.recurring_days.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {availability.recurring_days.map((day) => (
                              <Badge
                                key={day}
                                variant="secondary"
                                className="text-xs"
                              >
                                {weekdayLabels(day)}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveRow(
                            "users_availabilities",
                            availability.id
                          )
                        }
                        aria-label={t("remove")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}

              {isOwnProfile && (
                <div className="space-y-3 rounded-md border border-dashed p-3">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex-1">
                      <p className="mb-1 text-xs text-muted-foreground">
                        {t("start")}
                      </p>
                      <DateTimePicker
                        value={newAvailabilityStart}
                        onChange={setNewAvailabilityStart}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 text-xs text-muted-foreground">
                        {t("end")}
                      </p>
                      <DateTimePicker
                        value={newAvailabilityEnd}
                        onChange={setNewAvailabilityEnd}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      {t("recurring_days")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {WEEK_DAYS.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          size="sm"
                          variant={
                            newRecurringDays.includes(day)
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleRecurringDay(day)}
                        >
                          {weekdayLabels(day)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleAddAvailability}
                    disabled={!newAvailabilityStart || !newAvailabilityEnd}
                  >
                    <Plus className="mr-1 size-4" />
                    {t("add_availability")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
