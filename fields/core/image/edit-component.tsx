"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight, FolderOpen, Trash2, Upload } from "lucide-react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MediaDialog } from "@/components/media/media-dialog";
import { MediaUpload } from "@/components/media/media-upload";
import { Thumbnail } from "@/components/thumbnail";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfig } from "@/contexts/config-context";
import { getSchemaByName } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { normalizePath } from "@/lib/utils/file";
import { getAllowedExtensions } from "./index";

const generateId = () => uuidv4().slice(0, 8);

const ImageTeaser = ({
  file,
  config,
  media,
  onRemove,
}: {
  file: string;
  config: any;
  media: string;
  onRemove: (file: string) => void;
}) => (
  <>
    <div className="absolute right-1.5 bottom-1.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              className={cn(
                buttonVariants({ variant: "secondary", size: "icon-xs" }),
                "rounded-r-none"
              )}
              href={`https://github.com/${config.owner}/${config.repo}/blob/${config.branch}/${file}`}
              target="_blank"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>See on GitHub</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="rounded-l-none"
              onClick={() => onRemove(file)}
              size="icon-xs"
              type="button"
              variant="secondary"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </>
);

const SortableItem = ({
  id,
  file,
  config,
  media,
  onRemove,
}: {
  id: string;
  file: string;
  config: any;
  media: string;
  onRemove: (file: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners}>
        <Thumbnail className="h-28 w-28 rounded-md" name={media} path={file} />
      </div>
      <ImageTeaser
        config={config}
        file={file}
        media={media}
        onRemove={onRemove}
      />
    </div>
  );
};

const EditComponent = forwardRef(
  (props: any, ref: React.Ref<HTMLInputElement>) => {
    const { value, field, onChange } = props;
    const { config } = useConfig();

    const [files, setFiles] = useState<Array<{ id: string; path: string }>>(
      () =>
        value
          ? Array.isArray(value)
            ? value.map((path) => ({ id: generateId(), path }))
            : [{ id: generateId(), path: value }]
          : []
    );

    const mediaConfig = useMemo(
      () =>
        config?.object?.media?.length && field.options?.media !== false
          ? field.options?.media && typeof field.options.media === "string"
            ? getSchemaByName(config.object, field.options.media, "media")
            : config.object.media[0]
          : undefined,
      [field.options?.media, config?.object]
    );

    const rootPath = useMemo(() => {
      if (!field.options?.path) {
        return mediaConfig?.input;
      }

      const normalizedPath = normalizePath(field.options.path);
      const normalizedMediaPath = normalizePath(mediaConfig?.input);

      if (!normalizedPath.startsWith(normalizedMediaPath)) {
        console.warn(
          `"${field.options.path}" is not within media root "${mediaConfig?.input}". Defaulting to media root.`
        );
        return mediaConfig?.input;
      }

      return normalizedPath;
    }, [field.options?.path, mediaConfig?.input]);

    const allowedExtensions = useMemo(() => {
      if (!mediaConfig) return [];
      return getAllowedExtensions(field, mediaConfig);
    }, [field, mediaConfig]);

    const isMultiple = useMemo(
      () => !!field.options?.multiple,
      [field.options?.multiple]
    );

    const remainingSlots = useMemo(
      () =>
        field.options?.multiple
          ? typeof field.options.multiple === "object" &&
            field.options.multiple.max
            ? field.options.multiple.max - files.length
            : Number.POSITIVE_INFINITY
          : 1 - files.length,
      [field.options?.multiple, files.length]
    );

    useEffect(() => {
      if (isMultiple) {
        onChange(files.map((f) => f.path));
      } else {
        onChange(files[0]?.path ?? "");
      }
    }, [files, isMultiple, onChange]);

    const handleUpload = useCallback(
      (fileData: any) => {
        if (!config) return;

        const newFile = { id: generateId(), path: fileData.path };

        if (isMultiple) {
          setFiles((prev) => [...prev, newFile]);
        } else {
          setFiles([newFile]);
        }
      },
      [isMultiple, config]
    );

    const handleRemove = useCallback((fileId: string) => {
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    }, []);

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: any) => {
      const { active, over } = event;

      if (active.id !== over.id) {
        setFiles((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    const handleSelected = useCallback(
      (newPaths: string[]) => {
        if (newPaths.length === 0) {
          setFiles([]);
        } else {
          const newFiles = newPaths.map((path) => ({
            id: generateId(),
            path,
          }));

          if (isMultiple) {
            setFiles((prev) => [...prev, ...newFiles]);
          } else {
            setFiles([newFiles[0]]);
          }
        }
      },
      [isMultiple]
    );

    if (!mediaConfig) {
      return (
        <p className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
          No media configuration found.{" "}
          <a
            className="underline hover:text-foreground"
            href={`/${config?.owner}/${config?.repo}/${encodeURIComponent(config?.branch || "")}/settings`}
          >
            Check your settings
          </a>
          .
        </p>
      );
    }

    return (
      <MediaUpload
        extensions={allowedExtensions || undefined}
        media={mediaConfig.name}
        multiple={isMultiple}
        onUpload={handleUpload}
        path={rootPath}
      >
        <MediaUpload.DropZone>
          <div className="space-y-2">
            {files.length > 0 &&
              (isMultiple ? (
                <div className="flex flex-wrap gap-2">
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                  >
                    <SortableContext
                      items={files.map((f) => f.id)}
                      strategy={rectSortingStrategy}
                    >
                      {files.map((file) => (
                        <SortableItem
                          config={config}
                          file={file.path}
                          id={file.id}
                          key={file.id}
                          media={mediaConfig.name}
                          onRemove={() => handleRemove(file.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <div className="relative aspect-square w-28">
                  <Thumbnail
                    className="h-28 w-28 rounded-md"
                    name={mediaConfig.name}
                    path={files[0].path}
                  />
                  <ImageTeaser
                    config={config}
                    file={files[0].path}
                    media={mediaConfig.name}
                    onRemove={() => handleRemove(files[0].id)}
                  />
                </div>
              ))}
            {remainingSlots > 0 && (
              <div className="flex gap-2">
                <MediaUpload.Trigger>
                  <Button
                    className="gap-2"
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </Button>
                </MediaUpload.Trigger>
                <TooltipProvider>
                  <Tooltip>
                    <MediaDialog
                      extensions={allowedExtensions}
                      initialPath={rootPath}
                      maxSelected={remainingSlots}
                      media={mediaConfig.name}
                      onSubmit={handleSelected}
                    >
                      <TooltipTrigger asChild>
                        <Button size="icon-sm" type="button" variant="outline">
                          <FolderOpen className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                    </MediaDialog>
                    <TooltipContent>Select from media</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </MediaUpload.DropZone>
      </MediaUpload>
    );
  }
);

EditComponent.displayName = "EditComponent";

export { EditComponent };
