"use client";

import { Check, Loader } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/contexts/config-context";
import { useRepo } from "@/contexts/repo-context";
import { cn } from "@/lib/utils";

export function RepoBranches() {
  const { owner, repo, branches, setBranches } = useRepo();
  const { config } = useConfig();

  const [search, setSearch] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<
    string[] | undefined
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFilteredBranches(
      branches?.filter((branch) =>
        branch.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, branches]);

  const isValidBranchName = useCallback((name: string) => {
    if (!name || name.length > 255) return false;
    const validBranchRegex =
      /^(?!\/|.*(?:\/\.|\/\/|\.\.|@{|\\))[^\x20\x7f ~^:?*[\]]+(?<!\.|\/)$/;
    return validBranchRegex.test(name);
  }, []);

  const handleCreateBranch = async () => {
    if (config) {
      // TODO: do we ask the user to confirm?
      if (search || isValidBranchName(search)) {
        setIsSubmitting(true);
        try {
          const newBranch = search;

          const response = await fetch(
            `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/branches`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: newBranch,
              }),
            }
          );
          if (!response.ok)
            throw new Error(
              `Failed to create branch: ${response.status} ${response.statusText}`
            );

          const data: any = await response.json();

          if (data.status !== "success") throw new Error(data.message);

          if (branches) {
            setBranches([...branches, newBranch]);
          } else {
            setBranches([newBranch]);
          }
        } catch (error) {
          console.error("Error creating branch:", error);
          // TODO: display an error?
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  if (!branches || branches.length === 0) {
    return <div className="p-4 text-muted-foreground">No branches.</div>;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <header className="flex gap-x-2">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search branches by name"
          value={search}
        />
        <Button
          disabled={
            !(search && isValidBranchName(search)) ||
            branches.includes(search) ||
            isSubmitting
          }
          onClick={handleCreateBranch}
        >
          Create
          {isSubmitting && <Loader className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
      </header>
      <main className="scrollbar flex max-h-[calc(100vh-9rem)] flex-col gap-y-1 overflow-auto">
        {filteredBranches && filteredBranches.length > 0 ? (
          filteredBranches.map((branch) => (
            <Link
              className={cn(
                branch === config?.branch
                  ? "cursor-default bg-accent"
                  : "hover:bg-accent",
                "inline-flex items-center rounded-lg px-3 py-2 ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              href={`/${owner}/${repo}/${encodeURIComponent(branch)}`}
              key={branch}
            >
              <span className="truncate">{branch}</span>
              {branch === config?.branch && (
                <Check className="ml-auto h-4 w-4 opacity-50" />
              )}
            </Link>
          ))
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No branches found.
          </div>
        )}
      </main>
    </div>
  );
}
