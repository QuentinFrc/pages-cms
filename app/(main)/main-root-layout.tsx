"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { About } from "@/components/about";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from "@/components/user";
import { siteConfig } from "@/config";

type MainRootLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export function MainRootLayout({ children, sidebar }: MainRootLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        {sidebar ?? null}
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 md:hidden">
            <Image
              alt={siteConfig.assets.logo.alt}
              className="h-6 w-6"
              height={24}
              src={siteConfig.assets.logo.src}
              width={24}
            />
            <span className="font-semibold text-sm">{siteConfig.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <About />
            <User />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
