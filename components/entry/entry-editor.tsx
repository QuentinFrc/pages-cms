"use client";

import { ChevronLeft, EllipsisVertical, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyCreate } from "@/components/empty-create";
import { FileOptions } from "@/components/file/file-options";
import { Message } from "@/components/message";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/contexts/config-context";
import { parseAndValidateConfig } from "@/lib/config";
import {
  generateFilename,
  getPrimaryField,
  getSchemaByName,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  getFileExtension,
  getFileName,
  getParentPath,
  normalizePath,
} from "@/lib/utils/file";
import { EntryForm } from "./entry-form";

export function EntryEditor({
  name = "",
  path: initialPath,
  parent,
  title,
  onSave,
}: {
  name?: string;
  path?: string;
  parent?: string;
  title?: string;
  onSave?: (data: any) => void;
}) {
  const [path, setPath] = useState<string | undefined>(initialPath);
  const [entry, setEntry] = useState<Record<string, any> | null | undefined>(
    {}
  );
  const [sha, setSha] = useState<string | undefined>();
  const [displayTitle, setDisplayTitle] = useState<string>(title ?? "Edit");
  const [history, setHistory] = useState<Record<string, any>[]>();
  const [isLoading, setIsLoading] = useState(path ? true : false);
  const [error, setError] = useState<string | undefined | null>(null);
  // TODO: this feels like a bit of a hack
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const router = useRouter();

  const { config } = useConfig();
  if (!config) throw new Error("Configuration not found.");

  const schema = useMemo(() => {
    if (!name) return;
    return getSchemaByName(config?.object, name);
  }, [config, name]);

  const entryFields = useMemo(
    () =>
      !schema?.fields || schema.fields.length === 0
        ? [
            {
              name: "body",
              type: "code",
              label: false,
              options: {
                format:
                  schema?.extension ||
                  (entry?.name && getFileExtension(entry.name)) ||
                  "markdown",
                lintFn:
                  path === ".pages.yml"
                    ? (view: any) => {
                        const { parseErrors, validationErrors } =
                          parseAndValidateConfig(view.state.doc.toString());
                        return [...parseErrors, ...validationErrors];
                      }
                    : undefined,
              },
            },
          ]
        : schema?.list === true
          ? [
              {
                name: "listWrapper",
                label: false,
                type: "object",
                list: true,
                fields: schema.fields,
              },
            ]
          : schema.fields,
    [schema, entry, path]
  );

  const entryContentObject = useMemo(
    () =>
      path
        ? schema?.list === true
          ? { listWrapper: entry?.contentObject }
          : entry?.contentObject
        : schema?.list === true
          ? { listWrapper: {} }
          : {},
    [schema, entry, path]
  );

  const navigateBack = useMemo(() => {
    const parentPath = path ? getParentPath(path) : undefined;
    return schema && schema.type === "collection"
      ? `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collection/${schema.name}${parentPath && parentPath !== schema.path ? `?path=${encodeURIComponent(parentPath)}` : ""}`
      : "";
  }, [schema, config.owner, config.repo, config.branch, path]);

  useEffect(() => {
    const fetchEntry = async () => {
      if (path) {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/entries/${encodeURIComponent(path)}?name=${encodeURIComponent(name)}`
          );
          if (!response.ok)
            throw new Error(
              `Failed to fetch entry: ${response.status} ${response.statusText}`
            );

          const data: any = await response.json();

          if (data.status !== "success") throw new Error(data.message);

          setEntry(data.data);
          setSha(data.data.sha);

          if (initialPath && schema && schema.type === "collection") {
            const primaryField = getPrimaryField(schema);
            setDisplayTitle(
              `Editing "${data.data.contentObject?.[primaryField] || getFileName(normalizePath(path))}"`
            );
          }
        } catch (error: any) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEntry();
  }, [
    config.branch,
    config.owner,
    config.repo,
    name,
    path,
    refetchTrigger,
    initialPath,
    schema,
  ]);

  useEffect(() => {
    // TODO: add loading for history ?
    const fetchHistory = async () => {
      if (path) {
        try {
          const response = await fetch(
            `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/entries/${encodeURIComponent(path)}/history?name=${encodeURIComponent(name)}`
          );
          if (!response.ok)
            throw new Error(
              `Failed to fetch entry's history: ${response.status} ${response.statusText}`
            );

          const data: any = await response.json();

          if (data.status !== "success") throw new Error(data.message);

          setHistory(data.data);
        } catch (error: any) {
          console.error(error);
        }
      }
    };

    fetchHistory();
  }, [
    config.branch,
    config.owner,
    config.repo,
    path,
    sha,
    refetchTrigger,
    name,
  ]);

  const onSubmit = async (contentObject: any) => {
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        const savePath =
          path ??
          `${parent ?? schema.path}/${generateFilename(schema.filename, schema, contentObject)}`;

        const response = await fetch(
          `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/files/${encodeURIComponent(savePath)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: path === ".pages.yml" ? "settings" : "content",
              name,
              content:
                schema?.list === true
                  ? contentObject.listWrapper
                  : contentObject,
              sha,
            }),
          }
        );
        if (!response.ok)
          throw new Error(
            `Failed to save file: ${response.status} ${response.statusText}`
          );
        const data: any = await response.json();

        if (data.status !== "success") throw new Error(data.message);

        if (data.data.sha !== sha) setSha(data.data.sha);

        if (!path && schema.type === "collection")
          router.push(
            `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collection/${encodeURIComponent(name)}/edit/${encodeURIComponent(data.data.path)}`
          );

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(savePromise, {
      loading: "Saving your file",
      success: (response: any) => {
        if (onSave) onSave(response.data);
        return response.message;
      },
      error: (error: any) => error.message,
    });

    try {
      await savePromise;
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleDelete = (path: string) => {
    // TODO: disable save button or freeze form while deleting?
    if (schema.type === "collection") {
      router.push(
        `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collection/${encodeURIComponent(name)}`
      );
    } else {
      setRefetchTrigger(refetchTrigger + 1);
    }
  };

  const handleRename = (oldPath: string, newPath: string) => {
    setPath(newPath);
    router.replace(
      `/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/collection/${encodeURIComponent(name)}/edit/${encodeURIComponent(newPath)}`
    );
  };

  const loadingSkeleton = useMemo(
    () => (
      <div className="mx-auto flex w-full max-w-(--breakpoint-xl) gap-x-8">
        <div className="w-0 flex-1">
          <header className="mb-6 flex items-center">
            {navigateBack && (
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-xs" }),
                  "mr-4 shrink-0"
                )}
                href={navigateBack}
                prefetch={true}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}

            <h1 className="truncate font-semibold text-lg md:text-2xl">
              {displayTitle}
            </h1>
          </header>
          <div className="grid items-start gap-6">
            {path !== ".pages.yml" ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-10 w-48 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded" />
                  <div className="grid auto-cols-max grid-flow-col gap-4">
                    <Skeleton className="h-28 w-28 rounded-md" />
                    <Skeleton className="h-28 w-28 rounded-md" />
                    <Skeleton className="h-28 w-28 rounded-md" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-60 w-full rounded-md" />
                </div>
              </>
            ) : (
              <Skeleton className="h-96 w-full rounded-md" />
            )}
          </div>
        </div>
        <div className="hidden w-64 lg:block">
          <div className="sticky top-0 flex flex-col gap-y-4">
            <div className="flex gap-x-2">
              <Button className="w-full" disabled type="submit">
                Save
              </Button>
              {path && (
                <Button
                  className="shrink-0"
                  disabled
                  size="icon"
                  variant="outline"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              )}
            </div>
            {path && (
              <div className="flex flex-col gap-y-1 text-sm">
                <div className="flex items-center rounded-lg px-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="mb-2 h-5 w-24 rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                  </div>
                </div>
                <div className="flex items-center rounded-lg px-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="mb-2 h-5 w-24 rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                  </div>
                </div>
                <div className="flex items-center rounded-lg px-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="mb-2 h-5 w-24 rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                  </div>
                </div>
                <div className="px-3 py-2">
                  <Skeleton className="mb-2 h-5 w-28 rounded" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="fixed top-0 right-0 z-10 flex h-14 items-center gap-x-2 pr-4 md:pr-6 lg:hidden">
          {path && (
            <Button className="shrink-0" disabled size="icon" variant="outline">
              <History className="h-4 w-4" />
            </Button>
          )}
          <Button disabled type="submit">
            Save
          </Button>
          {path && (
            <Button className="shrink-0" disabled size="icon" variant="outline">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    ),
    [displayTitle, navigateBack, path]
  );

  if (error) {
    // TODO: should we use a custom error class with code?
    // TODO: errors show no header (unlike collection and media). Consider standardizing templates.
    if (error === "Not found") {
      return (
        <Message
          className="absolute inset-0"
          description={`The file "${schema.path}" has not been created yet.`}
          title="File missing"
        >
          <EmptyCreate name={schema.name} type="content">
            Create file
          </EmptyCreate>
        </Message>
      );
    }
    return (
      <Message
        className="absolute inset-0"
        cta="Go to settings"
        description={error}
        href={`/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/settings`}
        title="Something's wrong"
      />
    );
  }

  return isLoading ? (
    loadingSkeleton
  ) : (
    <EntryForm
      contentObject={entryContentObject}
      fields={entryFields}
      history={history}
      navigateBack={navigateBack}
      onSubmit={onSubmit}
      options={
        path &&
        sha && (
          <FileOptions
            name={name}
            onDelete={handleDelete}
            onRename={handleRename}
            path={path}
            sha={sha}
            type={path === ".pages.yml" ? "settings" : schema.type}
          >
            <Button
              className="shrink-0"
              disabled={isLoading}
              size="icon"
              variant="outline"
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </FileOptions>
        )
      }
      path={path}
      // filePath={(path && schema?.type === 'collection')
      //   ? <FilePath
      //       path={path}
      //       sha={sha}
      //       type={schema.type}
      //       name={name}
      //       onRename={handleRename}
      //     />
      //   : undefined
      // }
      title={displayTitle}
    />
  );
}
