"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import type { FriendUser } from "@/hooks/use-friendships";
import {
  ensureDirectConversation,
  sendDirectMessage,
  useDirectMessages,
} from "@/hooks/use-direct-messages";
import { UserAvatarFromRecord } from "@/components/user-avatar";
import { getUserDisplayName } from "@/lib/user-initials";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function directConversationQueryKey(friendPairId: string) {
  return ["directConversation", friendPairId] as const;
}

type FriendDirectMessageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendPairId: string;
  friendUser: FriendUser;
  currentUserId: string;
};

export function FriendDirectMessageSheet({
  open,
  onOpenChange,
  friendPairId,
  friendUser,
  currentUserId,
}: FriendDirectMessageSheetProps) {
  const t = useTranslations("Pages.FriendsPage");
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const {
    data: conversationId,
    isLoading: isLoadingConversation,
    isError: isConversationError,
  } = useQuery({
    queryKey: directConversationQueryKey(friendPairId),
    queryFn: () => ensureDirectConversation(friendPairId),
    enabled: open,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isConversationError) {
      toast.error(t("message_open_failed"));
    }
  }, [isConversationError, t]);

  const { data: messages, isLoading: isLoadingMessages } =
    useDirectMessages(conversationId);

  useEffect(() => {
    if (open && messages?.length) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  function handleSheetOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setDraftMessage("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSendMessage() {
    if (!conversationId || !draftMessage.trim()) return;
    setIsSending(true);
    try {
      await sendDirectMessage(conversationId, currentUserId, draftMessage);
      setDraftMessage("");
    } catch {
      toast.error(t("message_send_failed"));
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  }

  const isLoading = isLoadingConversation || isLoadingMessages;

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <UserAvatarFromRecord user={friendUser} />
            <SheetTitle>
              {getUserDisplayName(friendUser.first_name, friendUser.last_name) ||
                friendUser.email ||
                "Unknown"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4">
          <div className="flex flex-col gap-3 py-4">
            {isLoading && (
              <>
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-2/3 self-end" />
              </>
            )}
            {!isLoading && (!messages || messages.length === 0) && (
              <p className="text-center text-sm text-muted-foreground">
                {t("message_empty")}
              </p>
            )}
            {messages?.map((message) => {
              const isOwnMessage = message.sender_user_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    isOwnMessage
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <time
                    className={cn(
                      "mt-1 block text-xs opacity-70",
                      isOwnMessage ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                    dateTime={message.created_at}
                  >
                    {new Date(message.created_at).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              );
            })}
            <div ref={scrollAnchorRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 border-t border-border p-4">
          <Textarea
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={t("message_placeholder")}
            rows={2}
            disabled={!conversationId || isSending}
            className="min-h-[2.5rem] resize-none"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => void handleSendMessage()}
            disabled={!conversationId || isSending || !draftMessage.trim()}
            aria-label={t("send_message")}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
