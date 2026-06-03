"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useFriendships } from "@/hooks/use-friendships";
import createSupabaseBrowserClient from "@/lib/supabase/create-supabase-browser-client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Plus, Trash2, Send } from "lucide-react";

const FEED_QUERY_KEY = ["feed"] as const;

type FeedAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
} | null;

type FeedComment = {
  id: string;
  content: string;
  created_at: string;
  author_user_id: string;
  author: FeedAuthor;
};

type FeedPost = {
  id: string;
  title: string | null;
  content: string;
  post_type: string;
  visibility: string;
  created_at: string;
  author_user_id: string;
  author: FeedAuthor;
  post_likes: { id: string; user_id: string }[];
  post_comments: FeedComment[];
};

function getAuthorName(author: FeedAuthor): string {
  if (!author) return "";
  return `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim();
}

function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onAddComment,
}: {
  post: FeedPost;
  currentUserId: string | undefined;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
}) {
  const t = useTranslations("Pages.FeedPage");
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = post.post_likes.some((like) => like.user_id === currentUserId);
  const isOwn = post.author_user_id === currentUserId;

  async function handleSubmitComment() {
    if (!commentDraft.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(post.id, commentDraft.trim());
      setCommentDraft("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarUrl={post.author?.avatar_url}
              firstName={post.author?.first_name}
              lastName={post.author?.last_name}
              className="size-8"
              fallbackClassName="text-xs"
            />
            <div>
              <Link
                href={`/profile/${post.author?.id}`}
                className="text-sm font-medium hover:underline"
              >
                {getAuthorName(post.author)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{post.post_type}</Badge>
            {isOwn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {post.title && (
          <CardTitle className="mb-2 text-base">{post.title}</CardTitle>
        )}
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        <div className="mt-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={isLiked ? "text-primary" : ""}
            onClick={() => onLike(post.id)}
          >
            <Heart className={`mr-1 size-4 ${isLiked ? "fill-current" : ""}`} />
            {post.post_likes.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((current) => !current)}
          >
            <MessageCircle className="mr-1 size-4" />
            {post.post_comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <p className="text-sm font-medium">{t("comments")}</p>
            {post.post_comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("no_comments")}</p>
            ) : (
              <div className="space-y-3">
                {post.post_comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <UserAvatar
                      avatarUrl={comment.author?.avatar_url}
                      firstName={comment.author?.first_name}
                      lastName={comment.author?.last_name}
                      className="size-7"
                      fallbackClassName="text-xs"
                    />
                    <div className="rounded-md bg-muted px-3 py-2">
                      <Link
                        href={`/profile/${comment.author?.id}`}
                        className="text-xs font-medium hover:underline"
                      >
                        {getAuthorName(comment.author)}
                      </Link>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentUserId && (
              <div className="flex items-center gap-2">
                <Input
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder={t("write_comment")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !commentDraft.trim()}
                  aria-label={t("post_comment")}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FeedPage() {
  const t = useTranslations("Pages.FeedPage");
  const { data: currentUser } = useCurrentUser();
  const { data: friendships } = useFriendships(currentUser?.id);
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostType, setNewPostType] = useState<string>("ACHIEVEMENT");
  const [newPostVisibility, setNewPostVisibility] = useState<string>("PUBLIC");

  const { data: posts, isLoading } = useRealtimeQuery<FeedPost[]>({
    queryKey: FEED_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("posts")
        .select(
          `*,
           author:users!posts_author_user_id_fkey(id, first_name, last_name, avatar_url),
           post_likes(id, user_id),
           post_comments(id, content, created_at, author_user_id, author:users!post_comments_author_user_id_fkey(id, first_name, last_name, avatar_url))`
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as FeedPost[];
    },
    realtimeSubscriptions: [
      { table: "posts" },
      { table: "post_likes" },
      { table: "post_comments" },
    ],
  });

  const friendIds = useMemo(() => {
    const ids = new Set<string>();
    friendships?.friends.forEach((pair) => {
      const otherId =
        pair.requestor_user_id === currentUser?.id
          ? pair.receiver_user_id
          : pair.requestor_user_id;
      ids.add(otherId);
    });
    return ids;
  }, [friendships, currentUser?.id]);

  const friendsPosts = useMemo(
    () => posts?.filter((post) => friendIds.has(post.author_user_id)) ?? [],
    [posts, friendIds]
  );

  async function handleCreatePost() {
    if (!currentUser || !newPostContent.trim()) return;
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.from("posts").insert({
      author_user_id: currentUser.id,
      post_type: newPostType as "ACHIEVEMENT" | "RECOMMENDATION" | "FEEDBACK",
      visibility: newPostVisibility as "PUBLIC" | "FRIENDS_ONLY",
      title: newPostTitle || null,
      content: newPostContent,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setNewPostContent("");
    setNewPostTitle("");
    setCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
  }

  async function handleLike(postId: string) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: currentUser.id,
    });

    if (error && error.code === "23505") {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUser.id);
    }

    queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
  }

  async function handleDeletePost(postId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("posts").delete().eq("id", postId);
    queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
  }

  async function handleAddComment(postId: string, content: string) {
    if (!currentUser) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      author_user_id: currentUser.id,
      content,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
  }

  function renderPosts(list: FeedPost[]) {
    if (list.length === 0) {
      return (
        <p className="text-center text-muted-foreground">{t("no_posts")}</p>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser?.id}
            onLike={handleLike}
            onDelete={handleDeletePost}
            onAddComment={handleAddComment}
          />
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              {t("create_post")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("create_post")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t("post_title_placeholder")}
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <Textarea
                placeholder={t("post_content_placeholder")}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />
              <div className="flex gap-3">
                <Select value={newPostType} onValueChange={setNewPostType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACHIEVEMENT">
                      {t("post_type_achievement")}
                    </SelectItem>
                    <SelectItem value="RECOMMENDATION">
                      {t("post_type_recommendation")}
                    </SelectItem>
                    <SelectItem value="FEEDBACK">
                      {t("post_type_feedback")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newPostVisibility}
                  onValueChange={setNewPostVisibility}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      {t("visibility_public")}
                    </SelectItem>
                    <SelectItem value="FRIENDS_ONLY">
                      {t("visibility_friends")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                >
                  {t("submit_post")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t("general_tab")}</TabsTrigger>
          <TabsTrigger value="friends">{t("friends_tab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          {renderPosts(posts ?? [])}
        </TabsContent>
        <TabsContent value="friends" className="mt-4">
          {renderPosts(friendsPosts)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
