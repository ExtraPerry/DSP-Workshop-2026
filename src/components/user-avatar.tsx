import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserDisplayName, getUserInitials } from "@/lib/user-initials";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  avatarUrl,
  firstName,
  lastName,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const displayName = getUserDisplayName(firstName, lastName);
  const initials = getUserInitials(firstName, lastName);

  return (
    <Avatar className={className}>
      {avatarUrl ? (
        <AvatarImage
          src={avatarUrl}
          alt={displayName}
          className={imageClassName}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}

type UserAvatarFromRecordProps = {
  user: {
    avatar_url?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatarFromRecord({
  user,
  className,
  fallbackClassName,
}: UserAvatarFromRecordProps) {
  return (
    <UserAvatar
      avatarUrl={user?.avatar_url}
      firstName={user?.first_name}
      lastName={user?.last_name}
      className={cn(className)}
      fallbackClassName={fallbackClassName}
    />
  );
}
