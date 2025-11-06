"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { RepoSidebar } from "@/components/repo/repo-sidebar";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/contexts/config-context";
import { useRepo } from "@/contexts/repo-context";
import { trackVisit } from "@/lib/tracker";
import { cn } from "@/lib/utils";

export function RepoLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { config } = useConfig();
  const { owner, repo } = useRepo();

  const handleMenuClose = () => setMenuOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (config?.owner && config?.repo && config?.branch) {
      trackVisit(owner, repo, config.branch);
    }
  }, [config, owner, repo]);

  return (
    <>
      <div className="flex h-screen w-full">
        <aside className="hidden h-screen w-72 flex-col gap-y-2 border-r xl:flex">
          <RepoSidebar />
        </aside>
        <main className="relative flex h-screen flex-1 flex-col overflow-hidden">
          <div className="h-14 xl:h-0" />
          <div className="scrollbar flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
      <div className="xl:hidden">
        <div className="fixed top-0 right-0 left-0 flex h-14 items-center border-b bg-background px-4 md:px-6">
          <Button
            className="gap-x-2"
            onClick={() => setMenuOpen(true)}
            size="icon"
            variant="outline"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div
          className={cn(
            "invisible fixed inset-0 z-50 bg-black/80 opacity-0 transition-all duration-150",
            isMenuOpen ? "visible opacity-100" : ""
          )}
          onClick={handleMenuClose}
        />
        <aside
          className={cn(
            "-translate-x-full invisible fixed inset-y-0 z-50 flex h-screen w-[calc(100vw-4rem)] max-w-72 flex-col gap-y-2 border-r bg-background opacity-0 shadow-lg transition-all duration-500 ease-in-out",
            isMenuOpen ? "visible translate-x-0 opacity-100" : ""
          )}
        >
          <RepoSidebar onClick={handleMenuClose} />
        </aside>
      </div>
    </>
  );
}
