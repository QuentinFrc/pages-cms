"use client";

import { formatDistanceToNow } from "date-fns";
import { Ban } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { getVisits } from "@/lib/tracker";
import { cn } from "@/lib/utils";

export function RepoLatest() {
  const [recentVisits, setRecentVisits] = useState<any[]>([]);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const visits = getVisits();
      setRecentVisits(visits);
    }
  }, []);

  return (
    <>
      {recentVisits.length > 0 ? (
        <ul>
          {recentVisits.map((visit, index) => (
            <li
              className={cn(
                "flex items-center gap-x-2 border border-b-0 px-3 py-2 text-sm last:border-b",
                index === 0 && "rounded-t-md",
                index === recentVisits.length - 1 && "rounded-b-md"
              )}
              key={index}
            >
              <img
                alt={visit.owner}
                className="h-6 w-6 rounded"
                src={`https://github.com/${visit.owner}.png`}
              />
              <div className="truncate font-medium">{visit.repo}</div>
              <div className="truncate text-muted-foreground">
                {formatDistanceToNow(new Date(visit.timestamp * 1000))} ago
              </div>
              <Link
                className={cn(
                  "ml-auto",
                  buttonVariants({ variant: "outline", size: "xs" })
                )}
                href={`/${visit.owner}/${visit.repo}/${encodeURIComponent(visit.branch)}`}
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-[50px] items-center justify-center rounded-md bg-accent px-6 text-muted-foreground text-sm">
          <Ban className="mr-2 h-4 w-4" />
          No recent visits.
        </div>
      )}
    </>
  );
}
