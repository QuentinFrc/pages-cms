"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

const normalizeSlug = (slug: string) => slug.replace(/^\/+/, "");

const resolveHref = (slug: string) => {
  const normalizedSlug = normalizeSlug(slug);
  const baseUrl = process.env.PUBLIC_PROJET_URL;

  if (!baseUrl) {
    return `/${normalizedSlug}`;
  }

  try {
    return new URL(normalizedSlug, baseUrl).toString();
  } catch (error) {
    const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");
    return `${trimmedBaseUrl}/${normalizedSlug}`;
  }
};

const ViewComponent = ({ value }: { value: string | null | undefined }) => {
  if (!value) return null;

  const href = resolveHref(value);

  return (
    <span className="flex items-center gap-x-1.5">
      <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2 py-0.5 text-sm font-medium">
        <LinkIcon className="h-3 w-3 shrink-0" />
        <span className="max-w-[10rem] truncate font-mono text-xs">{value}</span>
      </span>
      <Button asChild variant="ghost" size="icon-xxs">
        <a href={href} target="_blank" rel="noreferrer">
          <ExternalLink className="h-3 w-3" />
          <span className="sr-only">Ouvrir le slug</span>
        </a>
      </Button>
    </span>
  );
};

export { ViewComponent };
