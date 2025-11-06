import { redirect } from "next/navigation";
import { Message } from "@/components/message";
import { RepoProvider } from "@/contexts/repo-context";
import { getAuth } from "@/lib/auth";
import { getToken } from "@/lib/token";
import { createOctokitInstance } from "@/lib/utils/octokit";
import type { Repo } from "@/types/repo";

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ owner: string; repo: string }>;
  }
) {
  const params = await props.params;

  const {
    owner,
    repo
  } = params;

  const {
    children
  } = props;

  const { session, user } = await getAuth();
  if (!session) return redirect("/sign-in");

  const token = await getToken(user, owner, repo);
  if (!token) throw new Error("Token not found");

  try {
    const octokit = createOctokitInstance(token);
    const repoResponse = await octokit.rest.repos.get({ owner, repo });

    const branches = [];
    let hasMore = true;
    let page = 1;

    while (hasMore) {
      const branchesResponse = await octokit.rest.repos.listBranches({
        owner,
        repo,
        page,
        per_page: 100,
      });
      if (branchesResponse.data.length === 0) break;
      branches.push(...branchesResponse.data);
      hasMore = branchesResponse.data.length === 100;
      page++;
    }

    const branchNames = branches.map((branch) => branch.name);

    if (branchNames.length === 0) {
      return (
        <Message
          className="absolute inset-0"
          cta="Select another repository"
          description={`You need to create a branch and add a ".pages.yml" file to configure it.`}
          href="/"
          title="This repository is empty."
        />
      );
    }

    const repoInfo: Repo = {
      id: repoResponse.data.id,
      owner: repoResponse.data.owner.login,
      ownerId: repoResponse.data.owner.id,
      repo: repoResponse.data.name,
      defaultBranch: repoResponse.data.default_branch,
      branches: branchNames,
      isPrivate: repoResponse.data.private,
    };

    return <RepoProvider repo={repoInfo}>{children}</RepoProvider>;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        // TODO: adjust as it may be the permissions as insufficient (suggest installing the app)
        return (
          <Message
            className="absolute inset-0"
            cta="Select another repository"
            description={
              <>It may have been removed, renamed or the path may be wrong.</>
            }
            href="/"
            title="This repository doesn't exist."
          />
        );
      case 403:
        return (
          <Message
            className="absolute inset-0"
            cta="Select another repository"
            description={
              <>
                You do not have the sufficient permissions to access this
                repository.
              </>
            }
            href="/"
            title="You can't access this repository."
          />
        );
      default:
        throw error;
    }
  }
}
