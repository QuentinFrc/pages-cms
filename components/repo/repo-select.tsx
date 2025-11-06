"use client";

import { formatDistanceToNow } from "date-fns";
import { Ban, ChevronsUpDown, LockKeyhole, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { handleAppInstall } from "@/lib/actions/app";
import { cn } from "@/lib/utils";

export function RepoSelect({
  onAccountSelect,
}: {
  onAccountSelect?: (account: any) => void;
}) {
  const { user } = useUser();

  const accounts = useMemo(() => {
    if (!user) return [];
    return user.accounts || [];
  }, [user]);

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword] = useDebounce(
    selectedAccount?.repositorySelection === "all" ? keyword : "",
    500
  );
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const searchResults = useMemo(() => {
    if (!results) return [];
    if (selectedAccount?.repositorySelection !== "all") {
      return results.filter((result: any) =>
        result.repo.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    return results;
  }, [results, keyword, selectedAccount]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedAccount) return;

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          type: selectedAccount.type,
          keyword: debouncedKeyword,
          repository_selection: selectedAccount.repositorySelection,
        });

        const response = await fetch(
          `/api/repos/${selectedAccount.login}?${params.toString()}`,
          { signal: abortControllerRef.current.signal }
        );
        if (!response.ok)
          throw new Error(
            `Failed to fetch repos: ${response.status} ${response.statusText}`
          );

        const data = await response.json();

        if (data.status !== "success") throw new Error(data.message);

        setResults(data.data);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error(error);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [debouncedKeyword, selectedAccount]);

  const resultsLoadingSkeleton = useMemo(
    () => (
      <ul>
        {[...Array(5)].map((_, index) => (
          <li
            className="flex items-center gap-x-2 border border-b-0 px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md last:border-b"
            key={index}
          >
            <Skeleton className="h-5 w-24 rounded text-left" />
            <Skeleton className="h-5 w-24 rounded text-left" />
            <Button className="ml-auto" disabled size="xs" variant="outline">
              Open
            </Button>
          </li>
        ))}
      </ul>
    ),
    []
  );

  return (
    <div className="flex flex-col gap-y-4">
      <div className="max-w flex w-full items-center gap-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="px-3" variant="outline">
              <img
                alt={`${selectedAccount?.login}'s avatar`}
                className="mr-2 h-6 w-6 rounded"
                src={`https://github.com/${selectedAccount?.login}.png`}
              />
              <span className="mr-2">{selectedAccount?.login}</span>
              <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {accounts.map((account: any) => (
              <DropdownMenuItem
                key={account.login}
                onSelect={() => {
                  setSelectedAccount(account);
                  if (onAccountSelect) onAccountSelect(account);
                }}
              >
                <img
                  alt={`${account.login}'s avatar`}
                  className="mr-2 h-6 w-6 rounded"
                  src={`https://github.com/${account.login}.png`}
                />
                {account.login}
              </DropdownMenuItem>
            ))}
            {user?.githubId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAppInstall()}>
                  Add a GitHub account
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative flex-1">
          <Input
            className="pl-9"
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search repositories by name"
            value={keyword}
          />
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 opacity-50" />
        </div>
      </div>
      {isLoading || results === null ? (
        resultsLoadingSkeleton
      ) : searchResults.length > 0 ? (
        <ul>
          {searchResults.map((result: any) => (
            <li
              className="flex items-center gap-x-2 border border-b-0 px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md last:border-b"
              key={`${result.owner}/${result.repo}`}
            >
              <div className="truncate font-medium">{result.repo}</div>
              {result.private && <LockKeyhole className="h-3 w-3 opacity-50" />}
              {result.updatedAt && (
                <div className="truncate text-muted-foreground">
                  {formatDistanceToNow(new Date(result.updatedAt))} ago
                </div>
              )}
              <Link
                className={cn(
                  "ml-auto",
                  buttonVariants({ variant: "outline", size: "xs" })
                )}
                href={`/${result.owner}/${result.repo}/${result.defaultBranch ? encodeURIComponent(result.defaultBranch) : ""}`}
                prefetch={true}
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-[50px] items-center justify-center rounded-md bg-accent px-6 text-muted-foreground text-sm">
          <Ban className="mr-2 h-4 w-4" />
          No projects found
        </div>
      )}
    </div>
  );
}
