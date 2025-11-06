"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfig } from "@/contexts/config-context";
import { getInitialsFromName } from "@/lib/utils/avatar";

export function EntryHistoryBlock({
  path,
  history,
}: {
  path: string;
  history: any;
}) {
  const { config } = useConfig();

  if (!history || history.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-y-1 text-sm">
        {history.slice(0, 3).map((item: any) => (
          <a
            className="flex items-center rounded-lg px-3 py-2 ring-offset-background transition-all hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={item.html_url}
            key={item.sha}
            target="_blank"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                alt={`${item.commit.author.name}'s avatar`}
                src={
                  item.author?.login
                    ? `https://github.com/${item.author.login}.png`
                    : undefined
                }
              />
              <AvatarFallback>
                {getInitialsFromName(item.commit.author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden text-left">
              <div className="truncate font-medium text-sm">
                {item.commit.author.name || item.author.login}
              </div>
              <div className="truncate text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(item.commit.author.date))} ago
              </div>
            </div>
          </a>
        ))}
        {history.length > 3 && (
          <a
            className="flex items-center rounded-lg px-3 py-2 ring-offset-background transition-all hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={`https://github.com/${config?.owner}/${config?.repo}/commits/${encodeURIComponent(config!.branch)}/${path}`}
            target="_blank"
          >
            <span className="mr-4">See all changes</span>
            <ArrowUpRight className="min-ml-4 ml-auto h-3 w-3 opacity-50" />
          </a>
        )}
      </div>
    </>
  );
}

export function EntryHistoryDropdown({
  path,
  history,
}: {
  path: string;
  history: any;
}) {
  const { config } = useConfig();

  if (!history || history.length === 0) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" type="button" variant="outline">
            <History className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {history.slice(0, 3).map((item: any) => (
            <DropdownMenuItem asChild key={item.sha}>
              <a
                className="w-full truncate"
                href={item.html_url}
                target="_blank"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    alt={`${item.commit.author.name}'s avatar`}
                    src={
                      item.author?.login
                        ? `https://github.com/${item.author.login}.png`
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {getInitialsFromName(item.commit.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 overflow-hidden text-left">
                  <div className="truncate">
                    {item.commit.author.name || item.author.login}
                  </div>
                  <div className="truncate text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(item.commit.author.date))} ago
                  </div>
                </div>
              </a>
            </DropdownMenuItem>
          ))}
          {history.length > 3 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a
                  className="flex w-full items-center"
                  href={`https://github.com/${config?.owner}/${config?.repo}/commits/${encodeURIComponent(config!.branch)}/${path}`}
                  target="_blank"
                >
                  <span className="mr-4">See all changes</span>
                  <ArrowUpRight className="min-ml-4 ml-auto h-3 w-3 opacity-50" />
                </a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
