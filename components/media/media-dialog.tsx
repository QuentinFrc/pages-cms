"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { MediaView } from "@/components/media/media-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConfig } from "@/contexts/config-context";
import { getSchemaByName } from "@/lib/schema";

export interface MediaDialogHandle {
  open: () => void;
  close: () => void;
}

const MediaDialog = forwardRef(
  (
    {
      media,
      selected,
      onSubmit,
      maxSelected,
      initialPath,
      children,
      extensions,
    }: {
      media?: string;
      onSubmit: (images: string[]) => void;
      selected?: string[];
      maxSelected?: number;
      initialPath?: string;
      children?: React.ReactNode;
      extensions?: string[];
    },
    ref
  ) => {
    const { config } = useConfig();
    if (!config) throw new Error("Configuration not found.");

    const configMedia = media
      ? getSchemaByName(config.object, media, "media")
      : config.object.media[0];

    const selectedImagesRef = useRef(selected || []);
    const [selectedImages, setSelectedImages] = useState(selected || []);
    const [open, setOpen] = useState(false);

    const handleSelect = useCallback((newSelected: string[]) => {
      selectedImagesRef.current = newSelected;
      setSelectedImages(newSelected);
    }, []);

    const handleSubmit = useCallback(() => {
      onSubmit(selectedImagesRef.current);
    }, [onSubmit]);

    const handleUpload = useCallback((entry: any) => {
      const newSelected = [...selectedImagesRef.current, entry.path];
      selectedImagesRef.current = newSelected;
      setSelectedImages(newSelected);
    }, []);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    return (
      <Dialog onOpenChange={setOpen} open={open}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="h-[calc(100vh-6rem)] w-full grid-rows-[auto_minmax(0,1fr)_auto] sm:w-[calc(100vw-6rem)] sm:max-w-(--breakpoint-xl)">
          <DialogHeader>
            <DialogTitle>Select images</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <MediaView
            extensions={extensions}
            initialPath={initialPath || ""}
            initialSelected={selectedImages}
            maxSelected={maxSelected}
            media={configMedia.name}
            onSelect={handleSelect}
            onUpload={handleUpload}
          />
          {configMedia.input && (
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  disabled={selectedImages.length === 0}
                  onClick={handleSubmit}
                  type="submit"
                >
                  Select
                </Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

MediaDialog.displayName = "MediaDialog";

export { MediaDialog };
