"use client";

import { Github } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config";
import { Message } from "@/components/message";
import { RepoLatest } from "@/components/repo/repo-latest";
import { RepoSelect } from "@/components/repo/repo-select";
import { RepoTemplates } from "@/components/repo/repo-templates";
import { SubmitButton } from "@/components/submit-button";
import { useUser } from "@/contexts/user-context";
import { handleAppInstall } from "@/lib/actions/app";
import { MainRootLayout } from "./main-root-layout";

export default function Page() {
  const [defaultAccount, setDefaultAccount] = useState<any>(null);
  const { user } = useUser();

  if (!user) throw new Error("User not found");
  if (!user.accounts) throw new Error("Accounts not found");

  return (
    <MainRootLayout>
      <div className="mx-auto max-w-(--breakpoint-sm) space-y-6">
        {user.accounts.length > 0 ? (
          <>
            <h2 className="font-semibold text-lg tracking-tight md:text-2xl">
              Last visited
            </h2>
            <RepoLatest />
            <h2 className="font-semibold text-lg tracking-tight md:text-2xl">
              Open a project
            </h2>
            <RepoSelect
              onAccountSelect={(account) => setDefaultAccount(account)}
            />
            {user?.githubId && (
              <>
                <h2 className="font-semibold text-lg tracking-tight md:text-2xl">
                  Create from a template
                </h2>
                <RepoTemplates defaultAccount={defaultAccount} />
              </>
            )}
          </>
        ) : user.githubId ? (
          <Message
            className="absolute inset-0"
            description={`You must install the GitHub application for the accounts you want to use ${siteConfig.name} with.`}
            title="Install the GitHub app"
          >
            <form action={handleAppInstall}>
              <SubmitButton type="submit">
                <Github className="mr-2 h-4 w-4" />
                Install
              </SubmitButton>
            </form>
          </Message>
        ) : (
          <Message
            className="absolute inset-0"
            description="You must be invited to a repository to collaborate. Ask the person who invited you or manages your organization to invite you."
            title="Nothing to see (yet)"
          />
        )}
      </div>
    </MainRootLayout>
  );
}
