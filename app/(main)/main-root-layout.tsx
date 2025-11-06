"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Github, LayoutDashboard, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/config";
import { About } from "@/components/about";
import { User } from "@/components/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings2,
  },
];

function SidebarNavigation({ pathname }: { pathname: string }) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                onClick={() => setOpenMobile(false)}
              >
                <Link href={item.href}>
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function MainRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            href="/"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
              <Image
                alt={siteConfig.assets.logo.alt}
                className="h-6 w-6"
                height={32}
                src={siteConfig.assets.logo.src}
                width={32}
              />
            </div>
            <span className="font-semibold text-sm">{siteConfig.name}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation pathname={pathname} />
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip="Read the documentation"
                variant="outline"
              >
                <a
                  href={siteConfig.links.docs}
                  rel="noopener"
                  target="_blank"
                >
                  <BookOpen className="size-4" />
                  <span>Documentation</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                tooltip="Open the project on GitHub"
                variant="outline"
              >
                <a
                  href={siteConfig.links.github}
                  rel="noopener"
                  target="_blank"
                >
                  <Github className="size-4" />
                  <span>GitHub</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
