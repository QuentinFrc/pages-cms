"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Message } from "@/components/message";
import { useConfig } from "@/contexts/config-context";

export default function Page() {
  const { config } = useConfig();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (config?.object.content?.[0]) {
      router.replace(
        `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/${config.object.content[0].type}/${config.object.content[0].name}`
      );
    } else if (config?.object.media) {
      router.replace(
        `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/media/${config.object.media[0].name}`
      );
    } else if (config?.object?.settings?.hide) {
      setError(true);
    } else {
      router.replace(
        `/${config?.owner}/${config?.repo}/${encodeURIComponent(config!.branch)}/settings`
      );
    }
  }, [config, router]);

  return error ? (
    <Message
      className="absolute inset-0"
      cta="Edit configuration on GitHub"
      description={
        <>
          This branch and/or repository has no configuration and settings are
          disabled. Edit on GitHub if you think this is a mistake.
        </>
      }
      href={`https://github.com/${config?.owner}/${config?.repo}/edit/${encodeURIComponent(config!.branch)}/.pages.yml`}
      title="Nothing to see here."
    />
  ) : null;
}
