"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSkills, useCampuses } from "@/hooks/use-lookups";
import { getLocalizedName } from "@/lib/localized-name";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus } from "lucide-react";

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

export default function MatchingPage() {
  const t = useTranslations("Pages.MatchingPage");
  const locale = useLocale();
  const { data: currentUser } = useCurrentUser();
  const { data: skills } = useSkills();
  const { data: campuses } = useCampuses();

  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [selectedCampusId, setSelectedCampusId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  async function handleSearch() {
    if (!currentUser) return;
    setIsSearching(true);

    const supabase = createSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-students`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          skill_id: selectedSkillId || undefined,
          campus_id: selectedCampusId || undefined,
        }),
      }
    );

    const result = await response.json();
    setSuggestions(result.suggestions ?? []);
    setIsSearching(false);
  }

  async function handleSendRequest(targetUserId: string, skillId: string) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.from("match_requests").insert({
      requestor_user_id: currentUser.id,
      target_user_id: targetUserId,
      skill_id: skillId,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setSentRequests((prev) => new Set(prev).add(targetUserId));
    toast.success(t("request_sent"));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="min-w-[200px] flex-1">
            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger>
                <SelectValue placeholder={t("all_skills")} />
              </SelectTrigger>
              <SelectContent>
                {skills?.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {getLocalizedName(skill, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[200px] flex-1">
            <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
              <SelectTrigger>
                <SelectValue placeholder={t("all_campuses")} />
              </SelectTrigger>
              <SelectContent>
                {campuses?.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {getLocalizedName(campus, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="mr-2 size-4" />
            {isSearching ? t("loading") : t("title")}
          </Button>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      )}

      {!isSearching && suggestions.length === 0 && (
        <p className="text-center text-muted-foreground">{t("no_results")}</p>
      )}

      {!isSearching && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={`${suggestion.user_id}-${suggestion.skill_id}`}>
              <CardContent className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {(suggestion.first_name?.charAt(0) ?? "") +
                        (suggestion.last_name?.charAt(0) ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/${suggestion.user_id}`}
                      className="font-medium hover:underline"
                    >
                      {suggestion.first_name} {suggestion.last_name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{suggestion.skill_name}</Badge>
                      <Badge variant="outline">
                        {t("skill_level")}: {suggestion.user_skill_level}
                      </Badge>
                      {suggestion.shared_campus && (
                        <Badge variant="default">{t("filter_campus")}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {t("match_score")}: {suggestion.match_score}
                  </span>
                  {sentRequests.has(suggestion.user_id) ? (
                    <Button disabled variant="outline" size="sm">
                      {t("request_sent")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSendRequest(
                          suggestion.user_id,
                          suggestion.skill_id
                        )
                      }
                    >
                      <UserPlus className="mr-1 size-4" />
                      {t("send_request")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
