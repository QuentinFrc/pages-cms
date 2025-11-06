"use client";

import {
  Ban,
  Check,
  CornerLeftUp,
  EllipsisVertical,
  File,
  Folder,
  FolderPlus,
  Upload,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyCreate } from "@/components/empty-create";
import { FileOptions } from "@/components/file/file-options";
import { FolderCreate } from "@/components/folder-create";
import { Message } from "@/components/message";
import { PathBreadcrumb } from "@/components/path-breadcrumb";
import { Thumbnail } from "@/components/thumbnail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/contexts/config-context";
import {
  extensionCategories,
  getFileName,
  getFileSize,
  getParentPath,
  normalizePath,
  sortFiles,
} from "@/lib/utils/file";
import { MediaUpload } from "./media-upload";

const MediaView = ({
  media,
  initialPath,
  initialSelected,
  maxSelected,
  onSelect,
  onUpload,
  extensions,
}: {
  media: string;
  initialPath?: string;
  initialSelected?: string[];
  maxSelected?: number;
  onSelect?: (newSelected: string[]) => void;
  onUpload?: (entry: any) => void;
  extensions?: string[];
}) => {
  const { config } = useConfig();
  if (!config) throw new Error("Configuration not found.");

  const mediaConfig = useMemo(() => {
    if (!media) return config.object.media[0];
    return config.object.media.find((item: any) => item.name === media);
  }, [media, config.object.media]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filteredExtensions = useMemo(() => {
    if (!(mediaConfig?.extensions || extensions)) return [];

    const allowedExtensions = extensions
      ? mediaConfig?.extensions
        ? extensions.filter((ext) => mediaConfig.extensions.includes(ext))
        : extensions
      : mediaConfig.extensions;

    return allowedExtensions || [];
  }, [extensions, mediaConfig?.extensions]);

  const filesGridRef = useRef<HTMLDivElement | null>(null);

  const [error, setError] = useState<string | null | undefined>(null);
  const [selected, setSelected] = useState(initialSelected || []);

  useEffect(() => {
    setSelected(initialSelected || []);
  }, [initialSelected]);

  const [path, setPath] = useState(() => {
    if (!mediaConfig) return "";
    if (!initialPath) return mediaConfig.input;
    const normalizedInitialPath = normalizePath(initialPath);
    if (normalizedInitialPath.startsWith(mediaConfig.input))
      return normalizedInitialPath;
    console.warn(
      `"${initialPath}" is not within media root "${mediaConfig.input}". Defaulting to media root.`
    );
    return mediaConfig.input;
  });
  const [data, setData] = useState<Record<string, any>[] | undefined>(
    undefined
  );

  // Filter the data based on filteredExtensions when displaying
  const filteredData = useMemo(() => {
    if (!data) return;
    if (!filteredExtensions || filteredExtensions.length === 0) return data;
    return data.filter(
      (item) =>
        item.type === "dir" ||
        filteredExtensions.includes(item.extension?.toLowerCase())
    );
  }, [data, filteredExtensions]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      if (config) {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/media/${encodeURIComponent(mediaConfig.name)}/${encodeURIComponent(path)}`
          );
          if (!response.ok)
            throw new Error(
              `Failed to fetch media: ${response.status} ${response.statusText}`
            );

          const data: any = await response.json();

          if (data.status !== "success") throw new Error(data.message);

          setData(data.data);
        } catch (error: any) {
          console.error(error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchMedia();
  }, [config, path, mediaConfig.name]);

  const handleUpload = useCallback(
    (entry: any) => {
      setData((prevData) => {
        if (!prevData) return [entry];
        return sortFiles([...prevData, entry]);
      });
      if (onUpload) onUpload(entry);
    },
    [onUpload]
  );

  const handleDelete = useCallback((path: string) => {
    setData((prevData) => prevData?.filter((item) => item.path !== path));
  }, []);

  const handleRename = useCallback((path: string, newPath: string) => {
    setData((prevData) => {
      if (!prevData) return;
      if (
        getParentPath(normalizePath(path)) ===
        getParentPath(normalizePath(newPath))
      ) {
        const newData = prevData?.map((item) =>
          item.path === path
            ? { ...item, path: newPath, name: getFileName(newPath) }
            : item
        );
        return sortFiles(newData);
      }
      return prevData?.filter((item) => item.path !== path);
    });
  }, []);

  const handleFolderCreate = useCallback((entry: any) => {
    const parentPath = getParentPath(entry.path);
    const parent = {
      type: "dir",
      name: getFileName(parentPath),
      path: parentPath,
      size: 0,
      url: null,
    };

    setData((prevData) => {
      if (!prevData) return [parent];
      return sortFiles([...prevData, parent]);
    });
  }, []);

  const handleNavigate = (newPath: string) => {
    setPath(newPath);
    if (!onSelect) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("path", newPath || mediaConfig.input);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleNavigateParent = () => {
    if (!path || path === mediaConfig.input) return;
    handleNavigate(getParentPath(path));
  };

  const handleSelect = useCallback(
    (path: string) => {
      setSelected((prevSelected) => {
        let newSelected = prevSelected;

        if (maxSelected != null && prevSelected.length >= maxSelected) {
          newSelected =
            maxSelected > 1 ? newSelected.slice(1 - maxSelected) : [];
        }

        newSelected = newSelected.includes(path)
          ? newSelected.filter((item) => item !== path)
          : [...newSelected, path];

        return newSelected;
      });
    },
    [maxSelected]
  );

  useEffect(() => {
    if (onSelect) onSelect(selected);
  }, [selected, onSelect]);

  const loadingSkeleton = useMemo(
    () => (
      <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <li>
          <div className="flex aspect-video items-center justify-center text-muted">
            <Folder className="h-[5.5rem] w-[5.5rem] animate-pulse stroke-[0.5]" />
          </div>
          <div className="flex items-center justify-center p-2">
            <div className="h-9 overflow-hidden">
              <Skeleton className="mb-2 h-5 w-24 rounded" />
            </div>
          </div>
        </li>
        {[...Array(3)].map((_, index) => (
          <li key={index}>
            <Skeleton className="aspect-video rounded-t-md rounded-b-none" />
            <div className="flex items-center gap-x-2 p-2">
              <div className="h-9 overflow-hidden">
                <Skeleton className="mb-2 h-5 w-24 rounded" />
                <Skeleton className="h-2 w-16 rounded" />
              </div>
              <Button
                className="ml-auto shrink-0"
                disabled
                size="icon"
                variant="ghost"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    ),
    []
  );

  if (!mediaConfig.input) {
    return (
      <Message
        className="absolute inset-0"
        cta="Go to settings"
        description="You have no media defined in your settings."
        href={`/${config.owner}/${config.repo}/${encodeURIComponent(config.branch)}/settings`}
        title="No media defined"
      />
    );
  }

  if (error) {
    // TODO: should we use a custom error class with code?
    if (path === mediaConfig.input && error === "Not found") {
      return (
        <Message
          className="absolute inset-0"
          description={`The media folder "${mediaConfig.input}" has not been created yet.`}
          title="Media folder missing"
        >
          <EmptyCreate name={mediaConfig.name} type="media">
            Create folder
          </EmptyCreate>
        </Message>
      );
    }
    return (
      <Message
        className="absolute inset-0"
        description={error}
        title="Something's wrong..."
      >
        <Button onClick={() => handleNavigate(mediaConfig.input)} size="sm">
          Go to media root
        </Button>
      </Message>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <header className="flex items-center gap-x-2">
        <div className="sm:flex-1">
          <PathBreadcrumb
            className="hidden sm:block"
            handleNavigate={handleNavigate}
            path={path}
            rootPath={mediaConfig.input}
          />
          <Button
            className="shrink-0 sm:hidden"
            disabled={!path || path === mediaConfig.input}
            onClick={handleNavigateParent}
            size="icon-sm"
            variant="outline"
          >
            <CornerLeftUp className="h-4 w-4" />
          </Button>
        </div>
        <FolderCreate
          name={mediaConfig.name}
          onCreate={handleFolderCreate}
          path={path}
          type="media"
        >
          <Button
            className="ml-auto"
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
        </FolderCreate>
        <MediaUpload
          extensions={filteredExtensions}
          media={mediaConfig.name}
          onUpload={handleUpload}
          path={path}
        >
          <MediaUpload.Trigger>
            <Button className="gap-2" size="sm" type="button">
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </MediaUpload.Trigger>
        </MediaUpload>
      </header>
      <MediaUpload
        extensions={filteredExtensions}
        media={mediaConfig.name}
        onUpload={handleUpload}
        path={path}
      >
        <MediaUpload.DropZone className="scrollbar flex-1 overflow-auto">
          <div className="relative flex h-full flex-col" ref={filesGridRef}>
            {isLoading ? (
              loadingSkeleton
            ) : filteredData && filteredData.length > 0 ? (
              <ul className="grid grid-cols-2 gap-8 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredData.map((item, index) => (
                  <li key={item.path}>
                    {item.type === "dir" ? (
                      <button
                        className="block w-full rounded-md outline-none hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        onClick={() => handleNavigate(item.path)}
                      >
                        <div className="flex aspect-video items-center justify-center">
                          <Folder className="h-[5.5rem] w-[5.5rem] stroke-[0.5]" />
                        </div>
                        <div className="flex items-center justify-center p-2">
                          <div className="h-9 overflow-hidden">
                            <div className="truncate font-medium text-sm">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <label htmlFor={`item-${index}`}>
                        {onSelect && (
                          <input
                            checked={selected.includes(item.path)}
                            className="peer sr-only"
                            id={`item-${index}`}
                            onChange={() => handleSelect(item.path)}
                            type="checkbox"
                          />
                        )}
                        <div
                          className={
                            onSelect &&
                            "relative rounded-md hover:bg-muted peer-checked:ring-2 peer-checked:ring-ring peer-checked:ring-offset-2 peer-checked:ring-offset-background peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-focus:ring-offset-background"
                          }
                        >
                          {extensionCategories.image.includes(
                            item.extension
                          ) ? (
                            <Thumbnail
                              className="aspect-video rounded-t-md"
                              name={mediaConfig.name}
                              path={item.path}
                            />
                          ) : (
                            <div className="flex aspect-video items-center justify-center rounded-md">
                              <File className="h-24 w-24 stroke-[0.5]" />
                            </div>
                          )}
                          <div className="flex items-center gap-x-2 p-2">
                            <div className="mr-auto h-9 overflow-hidden">
                              <div className="truncate font-medium text-sm">
                                {item.name}
                              </div>
                              <div className="truncate text-muted-foreground text-xs">
                                {getFileSize(item.size)}
                              </div>
                            </div>
                            <FileOptions
                              name={mediaConfig.name}
                              onDelete={handleDelete}
                              onRename={handleRename}
                              path={item.path}
                              portalProps={{ container: filesGridRef.current }}
                              sha={item.sha}
                              type="media"
                            >
                              <Button
                                className="shrink-0"
                                size="icon"
                                variant="ghost"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </FileOptions>
                          </div>
                          {onSelect && selected.includes(item.path) && (
                            <div className="absolute top-2 left-2 rounded-full bg-primary p-0.5 text-primary-foreground">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </label>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center justify-center p-6 text-muted-foreground text-sm">
                <Ban className="mr-2 h-4 w-4" />
                This folder is empty.
              </p>
            )}
          </div>
        </MediaUpload.DropZone>
      </MediaUpload>
    </div>
  );
};

export { MediaView };
