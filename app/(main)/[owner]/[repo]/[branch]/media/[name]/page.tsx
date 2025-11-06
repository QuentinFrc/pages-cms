"use client";;
import { use } from "react";

import { useSearchParams } from "next/navigation";
import { MediaView } from "@/components/media/media-view";
import { useConfig } from "@/contexts/config-context";

export default function Page(
  props: {
    params: Promise<{
      name: string;
    }>;
  }
) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const path = searchParams.get("path") || "";

  const { config } = useConfig();
  if (!config) throw new Error("Configuration not found.");

  return (
    <div className="mx-auto flex h-full max-w-(--breakpoint-xl) flex-1 flex-col">
      <header className="mb-6 flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Media</h1>
      </header>
      <div className="relative flex flex-1 flex-col">
        <MediaView initialPath={path} media={params.name} />
      </div>
    </div>
  );
}
