"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Message({
  title,
  description,
  href,
  cta,
  className,
  children,
}: {
  title: string;
  description: React.ReactNode;
  href?: string;
  cta?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex items-center justify-center p-4 md:p-6", className)}
    >
      <div className="max-w-[340px] text-center">
        <h1 className="mb-2 font-semibold text-xl tracking-tight lg:text-2xl">
          {title}
        </h1>
        <p className="mb-6 text-muted-foreground text-sm">{description}</p>
        {children ? (
          children
        ) : href && cta ? (
          <Link
            className={buttonVariants({ variant: "default", size: "sm" })}
            href={href}
          >
            {cta}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
