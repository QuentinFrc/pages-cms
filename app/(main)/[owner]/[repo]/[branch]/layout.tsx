import { redirect } from "next/navigation";
import { EmptyCreate } from "@/components/empty-create";
import { Message } from "@/components/message";
import { RepoLayout } from "@/components/repo/repo-layout";
import { ConfigProvider } from "@/contexts/config-context";
import { getAuth } from "@/lib/auth";
import { configVersion, normalizeConfig, parseConfig } from "@/lib/config";
import { getToken } from "@/lib/token";
import { getConfig, saveConfig, updateConfig } from "@/lib/utils/config";
import { createOctokitInstance } from "@/lib/utils/octokit";

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ owner: string; repo: string; branch: string }>;
  }
) {
  const params = await props.params;

  const {
    owner,
    repo,
    branch
  } = params;

  const {
    children
  } = props;

  const { session, user } = await getAuth();
  if (!session) return redirect("/sign-in");

  const token = await getToken(user, owner, repo);
  if (!token) throw new Error("Token not found");

  const decodedBranch = decodeURIComponent(branch);

  let config = {
    owner: owner.toLowerCase(),
    repo: repo.toLowerCase(),
    branch: decodedBranch,
    sha: "",
    version: "",
    object: {},
  };

  let errorMessage = null;

  // We try to retrieve the config file (.pages.yml)
  try {
    const octokit = createOctokitInstance(token);
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: ".pages.yml",
      ref: decodedBranch,
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (Array.isArray(response.data)) {
      throw new Error("Expected a file but found a directory");
    }
    if (response.data.type !== "file") {
      throw new Error("Invalid response type");
    }

    const savedConfig = await getConfig(owner, repo, decodedBranch);

    // TODO: make it resilient to config not found (e.g. DB down)

    if (
      savedConfig &&
      savedConfig.sha === response.data.sha &&
      savedConfig.version === configVersion
    ) {
      // Config in DB and up-to-date
      config = savedConfig;
    } else {
      const configFile = Buffer.from(
        response.data.content,
        "base64"
      ).toString();
      const parsedConfig = parseConfig(configFile);
      const configObject = normalizeConfig(parsedConfig.document.toJSON());

      config.sha = response.data.sha;
      config.version = configVersion ?? "0.0";
      config.object = configObject;

      if (savedConfig) {
        // Config in DB but outdated (based on sha or version)
        await updateConfig(config);
      } else {
        // Config not in DB
        await saveConfig(config);
      }
    }
  } catch (error: any) {
    if (error.status === 404) {
      if (error.response.data.message === "Not Found") {
        errorMessage = (
          <Message
            className="absolute inset-0"
            description={`You need to add a ".pages.yml" file to this branch.`}
            title="No configuration file"
          >
            <EmptyCreate type="settings">
              Create a configuration file
            </EmptyCreate>
          </Message>
        );
      } else {
        // We assume the branch is not valid
        errorMessage = (
          <Message
            className="absolute inset-0"
            cta={"Switch to the default branch"}
            description={`The branch "${decodedBranch}" doesn't exist. It may have been removed or renamed.`}
            href={`/${owner}/${repo}`}
            title="Invalid branch"
          />
        );
      }
      // TODO: catch all error (it's not always just one of these two)
    }
  }

  return (
    <ConfigProvider value={config}>
      <RepoLayout>{errorMessage ? errorMessage : children}</RepoLayout>
    </ConfigProvider>
  );
}
