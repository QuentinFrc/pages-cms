"use client";

import { useSearchParams } from "next/navigation";
import { MediaView } from "@/components/media/media-view";
import { useConfig } from "@/contexts/config-context";

export default function Page({
  params,
}: {
  params: {
    name: string;
  };
}) {
  const searchParams = useSearchParams();
  const path = searchParams.get("path") || "";

  const { config } = useConfig();
  if (!config) throw new Error("Configuration not found.");

  return (
    <div className="mx-auto flex h-full max-w-screen-xl flex-1 flex-col">
      <header className="mb-6 flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Media</h1>
      </header>
      <div className="relative flex flex-1 flex-col">
        <MediaView initialPath={path} media={params.name} />
      </div>
    </div>
  );
}
