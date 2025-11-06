"use client";

import { ChevronRight, Ellipsis, Folder, Pencil } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { FileRename } from "@/components/file/file-rename";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function FilePath({
  path,
  sha,
  type,
  name,
  onRename,
}: {
  path: string;
  sha: string;
  type: "collection" | "file" | "media" | "settings";
  name?: string;
  onRename?: (path: string, newPath: string) => void;
}) {
  const pathSegments = useMemo(() => path.split("/"), [path]);

  const [isRenameOpen, setIsRenameOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center">
        <div className="flex h-10 flex-1 items-center gap-x-1 overflow-hidden rounded-md rounded-r-none border-input border-y border-l bg-muted px-3 py-1 text-muted-foreground max-sm:hidden">
          {pathSegments.length > 3 && (
            <>
              <Ellipsis className="h-4 w-4 shrink-0" />
              <ChevronRight className="h-4 w-4 shrink-0" />
            </>
          )}
          {pathSegments
            .slice(pathSegments.length > 3 ? -2 : 0)
            .map((segment, index, array) => (
              <Fragment key={index}>
                <div className="flex items-center gap-x-1.5 truncate">
                  {index !== array.length - 1 && (
                    <Folder className="h-4 w-4 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "truncate",
                      index === array.length - 1 && "text-foreground"
                    )}
                  >
                    {segment}
                  </span>
                </div>
                {index !== array.length - 1 && (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </Fragment>
            ))}
        </div>
        <div className="flex h-10 flex-1 items-center gap-x-1 overflow-hidden rounded-md rounded-r-none border-input border-y border-l bg-muted px-3 py-1 sm:hidden">
          <span className="truncate">{path}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="rounded-l-none"
              onClick={() => setIsRenameOpen(true)}
              size="icon"
              type="button"
              variant="outline"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rename</TooltipContent>
        </Tooltip>
      </div>

      <FileRename
        isOpen={isRenameOpen}
        name={name}
        onOpenChange={setIsRenameOpen}
        onRename={onRename}
        path={path}
        sha={sha}
        type={type}
      />
    </>
  );
}
