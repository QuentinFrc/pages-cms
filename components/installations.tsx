"use client";

import { ArrowUpRight, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";

const Installations = () => {
  const { user } = useUser();

  if (!(user && user.accounts)) {
    return (
      <div className="flex h-[50px] items-center justify-center rounded-md bg-accent px-6 text-muted-foreground text-sm">
        <Ban className="mr-2 h-4 w-4" />
        No account with the Github application installed.
      </div>
    );
  }

  return (
    <ul>
      {user.accounts.map((account) => (
        <li
          className="flex items-center gap-x-3 border border-b-0 px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md last:border-b"
          key={account.login}
        >
          <div className="flex items-center gap-x-2">
            <img
              alt={`${account.login}'s avatar`}
              className="h-6 w-6 rounded"
              src={`https://github.com/${account.login}.png`}
            />
            <span className="truncate font-medium">{account.login}</span>
          </div>
          <Button asChild className="ml-auto h-8" size="sm" variant="outline">
            <a
              href={
                account.type === "org"
                  ? `https://github.com/organizations/${account.login}/settings/installations/${account.installationId ?? ""}`
                  : `https://github.com/settings/installations/${account.installationId ?? ""}`
              }
              target="_blank"
            >
              Manage
              <ArrowUpRight className="ml-1 h-3 w-3 opacity-50" />
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
};

export { Installations };
