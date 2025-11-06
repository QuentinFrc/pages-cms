"use client";

import { ArrowUpRight, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useConfig } from "@/contexts/config-context";
import { useRepo } from "@/contexts/repo-context";
import { RepoBranches } from "./repo-branches";

export function RepoDropdown({ onClick }: { onClick?: () => void }) {
  const router = useRouter();
  const { owner, repo, branches, defaultBranch } = useRepo();
  const { config } = useConfig();

  const displayBranches = useMemo(() => {
    let branchesToDisplay: string[] = [];
    if (config && branches && branches.length > 0) {
      if (branches.includes(config.branch))
        branchesToDisplay.push(config.branch);
      if (defaultBranch && config.branch !== defaultBranch)
        branchesToDisplay.push(defaultBranch);
      branchesToDisplay = branchesToDisplay.concat(
        branches
          .filter(
            (branch) => branch !== config.branch && branch !== defaultBranch
          )
          .slice(0, 5 - branchesToDisplay.length)
      );
    }
    return branchesToDisplay;
  }, [branches, config, defaultBranch]);

  const branchesCount = useMemo(() => {
    if (branches && branches.length > 5) return `5/${branches.length}`;
    return null;
  }, [branches]);

  const handleBranchChange = (branch: string) => {
    router.push(`/${owner}/${repo}/${encodeURIComponent(branch)}`);
  };

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-15 w-full justify-start px-3" variant="outline">
            <img
              alt="Picture of the author"
              className="h-10 w-10 rounded-lg"
              src={`https://github.com/${owner}.png`}
            />
            <div className="ml-3 overflow-hidden text-left">
              <div className="truncate font-medium">{repo}</div>
              <div className="truncate text-muted-foreground text-xs">
                {config?.branch}
              </div>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a
              href={`https://github.com/${owner}/${repo}`}
              onClick={onClick}
              target="_blank"
            >
              <span className="mr-4">See on GitHub</span>
              <ArrowUpRight className="min-ml-4 ml-auto h-3 w-3 opacity-50" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="w-40 font-medium text-muted-foreground text-xs">
            Branches{branchesCount && ` (${branchesCount})`}
          </DropdownMenuLabel>
          {displayBranches.length > 0 && (
            <>
              <DropdownMenuRadioGroup
                onValueChange={handleBranchChange}
                value={config?.branch}
              >
                {displayBranches.map((branch: string) => (
                  <DropdownMenuRadioItem
                    className="max-w-64"
                    key={branch}
                    onClick={onClick}
                    value={branch}
                  >
                    <span className="truncate">{branch}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DialogTrigger asChild>
            <DropdownMenuItem onClick={onClick}>
              Manage branches
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage branches</DialogTitle>
          </DialogHeader>
          <RepoBranches />
        </DialogContent>
      </DropdownMenu>
    </Dialog>
  );
}
