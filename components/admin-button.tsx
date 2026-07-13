"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";

export function AdminButton() {
  const { user } = useUser();

  if (!can.admin.access({ user })) return null;

  return (
    <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
      <Link href="/admin" aria-label="Admin panel">
        <Settings className="size-4" />
      </Link>
    </Button>
  );
}
