"use client";

import { Book, Chrome, CircleHelp, Github } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function About({ onClick }: { onClick?: () => void }) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <CircleHelp className="h-4 w-4" />
              <span className="sr-only">About Pages CMS</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>About Pages CMS</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Pages CMS</DialogTitle>
          <DialogDescription>
            Pages CMS is an Open Source Content Management System built for
            static websites (Jekyll, Next.js, VuePress, Hugo, etc). It allows
            you to edit your website&apos;s content directly on GitHub via a
            user-friendly interface.
          </DialogDescription>
        </DialogHeader>
        <footer className="grid grid-flow-col justify-stretch gap-x-2 text-sm">
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
            href="https://pagescms.org"
            rel="noopener"
            target="_blank"
          >
            <Chrome className="mr-2 h-4 w-4 shrink-0" />
            Website
          </a>
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
            href="https://pagescms.org/docs"
            rel="noopener"
            target="_blank"
          >
            <Book className="mr-2 h-4 w-4 shrink-0" />
            Docs
          </a>
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
            href="https://github.com/pages-cms/pages-cms"
            rel="noopener"
            target="_blank"
          >
            <Github className="mr-2 h-4 w-4 shrink-0" />
            GitHub
          </a>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
