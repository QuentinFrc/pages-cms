"use client";

import { Collaborators } from "@/components/collaborators";
import { useConfig } from "@/contexts/config-context";

export default function Page() {
  const { config } = useConfig();
  if (!config) throw new Error("Configuration not found.");

  return (
    <div className="mx-auto flex h-full max-w-(--breakpoint-sm) flex-1 flex-col">
      <header className="mb-6 flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Collaborators</h1>
      </header>
      <div className="relative flex flex-1 flex-col">
        <Collaborators
          branch={config?.branch}
          owner={config.owner}
          repo={config.repo}
        />
      </div>
    </div>
  );
}
