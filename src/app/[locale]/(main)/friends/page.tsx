"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useFriendships } from "@/hooks/use-friendships";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { friendshipsQueryKey } from "@/hooks/use-friendships";
import { sendFriendRequest } from "@/lib/friendships/send-friend-request";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { UserCheck, UserX, Eye, UserPlus, Search } from "lucide-react";
import type { FriendUser } from "@/hooks/use-friendships";

function getUserDisplayName(user: FriendUser | null): string {
  if (!user) return "Unknown";
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  return user.email ?? "Unknown";
}

function getInitials(user: FriendUser | null): string {
  if (!user) return "?";
  const first = user.first_name?.charAt(0)?.toUpperCase() ?? "";
  const last = user.last_name?.charAt(0)?.toUpperCase() ?? "";
  return first + last || "?";
}

export default function FriendsPage() {
  const t = useTranslations("Pages.FriendsPage");
  const { data: currentUser } = useCurrentUser();
  const { data: friendships, isLoading } = useFriendships(currentUser?.id);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["userSearch", searchTerm],
    enabled: searchTerm.trim().length >= 2,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const term = `%${searchTerm.trim()}%`;
      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, email")
        .or(
          `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
        )
        .limit(10);
      if (error) throw error;
      return (data ?? []) as FriendUser[];
    },
  });

  const relationshipStatusByUserId = useMemo(() => {
    const statuses = new Map<string, "friend" | "pending">();
    friendships?.friends.forEach((pair) => {
      const otherId =
        pair.requestor_user_id === currentUser?.id
          ? pair.receiver_user_id
          : pair.requestor_user_id;
      statuses.set(otherId, "friend");
    });
    [
      ...(friendships?.outgoingRequests ?? []),
      ...(friendships?.incomingRequests ?? []),
    ].forEach((request) => {
      const otherId =
        request.requestor_user_id === currentUser?.id
          ? request.receiver_user_id
          : request.requestor_user_id;
      if (!statuses.has(otherId)) statuses.set(otherId, "pending");
    });
    return statuses;
  }, [friendships, currentUser?.id]);

  async function handleSendRequest(receiverUserId: string) {
    if (!currentUser) return;
    try {
      await sendFriendRequest(currentUser.id, receiverUserId);
      toast.success(t("request_sent"));
      queryClient.invalidateQueries({
        queryKey: friendshipsQueryKey(currentUser.id),
      });
    } catch {
      toast.error(t("no_search_results"));
    }
  }

  async function handleAcceptRequest(requestId: string, requestorUserId: string) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();

    await supabase.from("friend_pairs").insert({
      requestor_user_id: requestorUserId,
      receiver_user_id: currentUser.id,
    });

    await supabase.from("friend_requests").delete().eq("id", requestId);

    queryClient.invalidateQueries({
      queryKey: friendshipsQueryKey(currentUser.id),
    });
  }

  async function handleRejectRequest(requestId: string) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("friend_requests").delete().eq("id", requestId);
    queryClient.invalidateQueries({
      queryKey: friendshipsQueryKey(currentUser.id),
    });
  }

  async function handleRemoveFriend(pairId: string) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("friend_pairs").delete().eq("id", pairId);
    queryClient.invalidateQueries({
      queryKey: friendshipsQueryKey(currentUser.id),
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("search_title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("search_placeholder")}
              className="pl-9"
            />
          </div>

          {searchTerm.trim().length >= 2 &&
            (!searchResults || searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("no_search_results")}
              </p>
            ) : (
              <div className="space-y-2">
                {searchResults
                  .filter((user) => user.id !== currentUser?.id)
                  .map((user) => {
                    const status = relationshipStatusByUserId.get(user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {getUserDisplayName(user)}
                          </span>
                        </div>
                        {status === "friend" ? (
                          <Button variant="outline" size="sm" disabled>
                            {t("already_friends")}
                          </Button>
                        ) : status === "pending" ? (
                          <Button variant="outline" size="sm" disabled>
                            {t("request_pending")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(user.id)}
                          >
                            <UserPlus className="mr-1 size-4" />
                            {t("send_request")}
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">{t("friends_tab")}</TabsTrigger>
          <TabsTrigger value="incoming">{t("incoming_tab")}</TabsTrigger>
          <TabsTrigger value="outgoing">{t("outgoing_tab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>{t("friends_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!friendships?.friends.length ? (
                <p className="text-muted-foreground">{t("no_friends")}</p>
              ) : (
                <div className="space-y-3">
                  {friendships.friends.map((pair) => {
                    const friend =
                      pair.requestor_user_id === currentUser?.id
                        ? pair.receiver
                        : pair.requestor;
                    return (
                      <div
                        key={pair.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(friend)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {getUserDisplayName(friend)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/profile/${friend?.id}`}>
                              <Eye className="mr-1 size-4" />
                              {t("view_profile")}
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFriend(pair.id)}
                          >
                            <UserX className="mr-1 size-4" />
                            {t("remove_friend")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>{t("incoming_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!friendships?.incomingRequests.length ? (
                <p className="text-muted-foreground">{t("no_incoming")}</p>
              ) : (
                <div className="space-y-3">
                  {friendships.incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(request.requestor)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getUserDisplayName(request.requestor)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleAcceptRequest(
                              request.id,
                              request.requestor_user_id
                            )
                          }
                        >
                          <UserCheck className="mr-1 size-4" />
                          {t("accept")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          {t("reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outgoing">
          <Card>
            <CardHeader>
              <CardTitle>{t("outgoing_tab")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!friendships?.outgoingRequests.length ? (
                <p className="text-muted-foreground">{t("no_outgoing")}</p>
              ) : (
                <div className="space-y-3">
                  {friendships.outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(request.receiver)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {getUserDisplayName(request.receiver)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        {t("cancel_request")}
                      </Button>
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
