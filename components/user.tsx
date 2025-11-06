"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/user-context";
import { handleSignOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { getInitialsFromName } from "@/lib/utils/avatar";

export function User({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(className, "rounded-full")}
          size="icon-sm"
          variant="ghost"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              alt={user?.githubId ? user.githubUsername : user.email}
              src={
                user?.githubId
                  ? `https://avatars.githubusercontent.com/u/${user.githubId}`
                  : `https://unavatar.io/${user?.email}?fallback=false`
              }
            />
            <AvatarFallback>
              {getInitialsFromName(user.githubName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-[12.5rem]" forceMount>
        <DropdownMenuLabel>
          {user?.githubId ? (
            <>
              <div className="truncate font-medium text-sm">
                {user.githubName ? user.githubName : user.githubUsername}
              </div>
              <div className="truncate font-normal text-muted-foreground text-xs">
                {user.githubEmail}
              </div>
            </>
          ) : (
            <div className="truncate font-medium text-sm">{user.email}</div>
          )}
        </DropdownMenuLabel>
        {user?.githubId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href={`https://github.com/${user.githubUsername}`}
                onClick={onClick}
                target="_blank"
              >
                <span className="mr-4">See GitHub profile</span>
                <ArrowUpRight className="ml-auto h-3 w-3 opacity-50" />
              </a>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="w-40 font-medium text-muted-foreground text-xs">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
          <DropdownMenuRadioItem onClick={onClick} value="light">
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem onClick={onClick} value="dark">
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem onClick={onClick} value="system">
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            if (onClick) onClick();
            await handleSignOut();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
