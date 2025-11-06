"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CollectionView } from "@/components/collection/collection-view";
import { useConfig } from "@/contexts/config-context";
import { getSchemaByName } from "@/lib/schema";

export default function Page({
  params,
}: {
  params: {
    owner: string;
    repo: string;
    branch: string;
    name: string;
  };
}) {
  const { config } = useConfig();
  if (!config) throw new Error("Configuration not found.");

  const name = decodeURIComponent(params.name);
  const schema = useMemo(
    () => getSchemaByName(config?.object, name),
    [config, name]
  );
  if (!schema) throw new Error(`Schema not found for ${name}.`);

  const searchParams = useSearchParams();
  const path = searchParams.get("path") || "";

  return (
    <div className="mx-auto flex max-w-screen-xl flex-1 flex-col">
      <header className="mb-6 flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">
          {schema.label || schema.name}{" "}
        </h1>
      </header>
      <div className="flex flex-1 flex-col">
        <CollectionView name={name} path={path} />
      </div>
    </div>
  );
}
