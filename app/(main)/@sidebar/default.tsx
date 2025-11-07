"use client";

import type { LucideIcon } from "lucide-react";
import { BookOpen, Github, LayoutDashboard, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config";

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

export default function SidebarDefaultSlot() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-sidebar-border border-b">
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
      <SidebarFooter className="mt-auto border-sidebar-border border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="sm"
              tooltip="Read the documentation"
              variant="outline"
            >
              <a href={siteConfig.links.docs} rel="noopener" target="_blank">
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
              <a href={siteConfig.links.github} rel="noopener" target="_blank">
                <Github className="size-4" />
                <span>GitHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </>
  );
}
