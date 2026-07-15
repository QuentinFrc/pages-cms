"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function AdminButton({
  variant = "default",
}: {
  variant?: "default" | "sidebar";
}) {
  const { user } = useUser();

  if (!can.admin.access({ user })) return null;

  if (variant === "sidebar") {
    return (
      <SidebarMenuButton asChild tooltip="Admin panel">
        <Link href="/admin" aria-label="Admin panel">
          <Settings className="size-4" />
          <span>Admin panel</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
      <Link href="/admin" aria-label="Admin panel">
        <Settings className="size-4" />
      </Link>
    </Button>
  );
}
