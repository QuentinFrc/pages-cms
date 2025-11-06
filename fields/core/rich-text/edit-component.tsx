"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronsUpDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
} from "lucide-react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  MediaDialog,
  type MediaDialogHandle,
} from "@/components/media/media-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/contexts/config-context";
import { useRepo } from "@/contexts/repo-context";
import { getRawUrl, relativeToRawUrls } from "@/lib/githubImage";
import { getSchemaByName } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { extensionCategories, normalizePath } from "@/lib/utils/file";
import Commands from "./slash-command/commands";
import suggestion from "./slash-command/suggestion";

const EditComponent = forwardRef((props: any, ref) => {
  const { config } = useConfig();
  const { isPrivate } = useRepo();

  const { value, field, onChange } = props;

  const mediaConfig = useMemo(
    () =>
      config?.object?.media?.length && field.options?.media !== false
        ? field.options?.media && typeof field.options.media === "string"
          ? getSchemaByName(config.object, field.options.media, "media")
          : config.object.media[0]
        : undefined,
    [field.options?.media, config?.object]
  );

  const allowedExtensions = useMemo(() => {
    if (!mediaConfig) return [];

    let extensions = extensionCategories["image"];

    const fieldExtensions = field.options?.extensions
      ? field.options.extensions
      : field.options?.categories
        ? field.options.categories.flatMap(
            (category: string) => extensionCategories[category]
          )
        : [];

    if (fieldExtensions.length) {
      extensions = extensions.filter((ext) => fieldExtensions.includes(ext));
    }

    if (mediaConfig.extensions) {
      extensions = extensions.filter((ext) =>
        mediaConfig.extensions.includes(ext)
      );
    }

    return extensions;
  }, [field.options?.extensions, field.options?.categories, mediaConfig]);

  const mediaDialogRef = mediaConfig
    ? useRef<MediaDialogHandle>(null)
    : undefined;

  const bubbleMenuRef = useRef<HTMLDivElement | null>(null);

  const [isContentReady, setContentReady] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const openMediaDialog = mediaConfig?.input
    ? () => {
        if (mediaDialogRef?.current) mediaDialogRef.current.open();
      }
    : undefined;

  const rootPath = useMemo(() => {
    if (!mediaConfig) return;

    if (!field.options?.path) return mediaConfig?.input;

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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        dropcursor: { width: 2 },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: { default: null },
            style: { default: null },
            width: { default: null },
            height: { default: null },
          };
        },
      }).configure({ inline: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: null,
          target: null,
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands…",
      }),
      Commands.configure({
        suggestion: suggestion(openMediaDialog),
      }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: "<p></p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onCreate: async ({ editor }) => {
      if (config && value) {
        try {
          const initialContent = mediaConfig
            ? await relativeToRawUrls(
                config.owner,
                config.repo,
                config.branch,
                mediaConfig.name,
                value,
                isPrivate
              )
            : value;
          editor.commands.setContent(initialContent || "<p></p>");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.warn(errorMessage);
          toast.error(
            `${errorMessage} Check if the image exists or if media configuration is correct.`
          );
          editor.commands.setContent(value);
        }
      }
      setContentReady(true);
    },
  });

  const handleMediaDialogSubmit = useCallback(
    async (images: string[]) => {
      if (!mediaConfig) return;

      if (config && editor) {
        const content = await Promise.all(
          images.map(async (image) => {
            try {
              // Use unencoded path for API call, but encode for the final URL
              const url = await getRawUrl(
                config.owner,
                config.repo,
                config.branch,
                mediaConfig?.name,
                image,
                isPrivate
              );
              if (url) {
                // Replace the unencoded path with encoded path in the URL
                const encodedImage = image
                  .split("/")
                  .map(encodeURIComponent)
                  .join("/");
                const encodedUrl = url.replace(image, encodedImage);
                return `<p><img src="${encodedUrl}"></p>`;
              }
              // return `<p><img src="${url}"></p>`;
              return `<p><img src="" alt="${image}" class="border border-destructive bg-destructive/10 rounded-md" /></p>`;
            } catch {
              toast.error(`Failed to load image: ${image}`);
              // Return a placeholder with error styling
              return `<p><img src="" alt="${image}" class="border border-destructive bg-destructive/10 rounded-md" /></p>`;
            }
          })
        );
        editor.chain().focus().insertContent(content.join("\n")).run();
      }
    },
    [config, editor, isPrivate, mediaConfig?.name]
  );

  const getBlockIcon = (editor: any) => {
    if (editor.isActive("heading", { level: 1 }))
      return <Heading1 className="h-4 w-4" />;
    if (editor.isActive("heading", { level: 2 }))
      return <Heading2 className="h-4 w-4" />;
    if (editor.isActive("heading", { level: 3 }))
      return <Heading3 className="h-4 w-4" />;
    if (editor.isActive("bulletList")) return <List className="h-4 w-4" />;
    if (editor.isActive("orderedList"))
      return <ListOrdered className="h-4 w-4" />;
    if (editor.isActive("codeBlock")) return <Code className="h-4 w-4" />;
    if (editor.isActive("blockquote")) return <Quote className="h-4 w-4" />;
    return <Pilcrow className="h-4 w-4" />;
  };

  const getAlignIcon = (editor: any) => {
    if (editor.isActive({ textAlign: "center" }))
      return <AlignCenter className="h-4 w-4" />;
    if (editor.isActive({ textAlign: "right" }))
      return <AlignRight className="h-4 w-4" />;
    if (editor.isActive({ textAlign: "justify" }))
      return <AlignJustify className="h-4 w-4" />;
    return <AlignLeft className="h-4 w-4" />;
  };

  return (
    <>
      <Skeleton
        className={cn("h-34 rounded-md", isContentReady ? "hidden" : "")}
      />
      <div className={isContentReady ? "" : "hidden"}>
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 25,
              animation: "scale",
              maxWidth: "370px",
            }}
          >
            <div
              className="flex items-center gap-x-px rounded-md border bg-popover p-1 shadow-md focus-visible:outline-hidden"
              ref={bubbleMenuRef}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="gap-x-1"
                    size="xxs"
                    type="button"
                    variant="ghost"
                  >
                    {getBlockIcon(editor)}
                    <ChevronsUpDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  portalProps={{ container: bubbleMenuRef.current }}
                >
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                  >
                    <Pilcrow className="h-4 w-4" />
                    Text
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setNode("heading", { level: 1 })
                        .run()
                    }
                  >
                    <Heading1 className="h-4 w-4" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setNode("heading", { level: 2 })
                        .run()
                    }
                  >
                    <Heading2 className="h-4 w-4" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setNode("heading", { level: 3 })
                        .run()
                    }
                  >
                    <Heading3 className="h-4 w-4" />
                    Heading 3
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-4 w-4" />
                    Bulleted list
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                    Numbered list
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setParagraph()
                        .toggleBlockquote()
                        .run()
                    }
                  >
                    <Quote className="h-4 w-4" />
                    Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-x-1.5"
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                  >
                    <Code className="h-4 w-4" />
                    Code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "shrink-0",
                      editor.isActive("link") ? "bg-muted" : ""
                    )}
                    onClick={() =>
                      setLinkUrl(
                        editor.isActive("link")
                          ? editor.getAttributes("link").href
                          : ""
                      )
                    }
                    size="icon-xxs"
                    type="button"
                    variant="ghost"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-1">
                  <div className="flex items-center gap-x-1">
                    <Input
                      className="h-8 flex-1"
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="e.g. http://pagescms.org"
                      value={linkUrl}
                    />
                    <Button
                      className="shrink-0"
                      onClick={() =>
                        linkUrl
                          ? editor
                              .chain()
                              .focus()
                              .extendMarkRange("link")
                              .setLink({ href: linkUrl })
                              .run()
                          : editor
                              .chain()
                              .focus()
                              .extendMarkRange("link")
                              .unsetLink()
                              .run()
                      }
                      size="xxs"
                      type="button"
                      variant="ghost"
                    >
                      Link
                    </Button>
                    <Button
                      className="shrink-0"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .unsetLink()
                          .run()
                      }
                      size="xxs"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {(editor.isActive("paragraph") || editor.isActive("heading")) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="gap-x-1"
                      size="xxs"
                      type="button"
                      variant="ghost"
                    >
                      {getAlignIcon(editor)}
                      <ChevronsUpDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    portalProps={{ container: bubbleMenuRef.current }}
                  >
                    <DropdownMenuItem
                      className="gap-x-1.5"
                      onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                      }
                    >
                      <AlignLeft className="h-4 w-4" />
                      Align left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-x-1.5"
                      onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                      }
                    >
                      <AlignRight className="h-4 w-4" />
                      Align right
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-x-1.5"
                      onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                      }
                    >
                      <AlignCenter className="h-4 w-4" />
                      Center
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-x-1.5"
                      onClick={() =>
                        editor.chain().focus().setTextAlign("justify").run()
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                      Justify
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                className={cn(
                  "shrink-0",
                  editor.isActive("bold") ? "bg-muted" : ""
                )}
                onClick={() => editor.chain().focus().toggleBold().run()}
                size="icon-xxs"
                type="button"
                variant="ghost"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "shrink-0",
                  editor.isActive("italic") ? "bg-muted" : ""
                )}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                size="icon-xxs"
                type="button"
                variant="ghost"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "shrink-0",
                  editor.isActive("strike") ? "bg-muted" : ""
                )}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                size="icon-xxs"
                type="button"
                variant="ghost"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "shrink-0",
                  editor.isActive("underline") ? "bg-muted" : ""
                )}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                size="icon-xxs"
                type="button"
                variant="ghost"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "shrink-0",
                  editor.isActive("code") ? "bg-muted" : ""
                )}
                onClick={() => editor.chain().focus().toggleCode().run()}
                size="icon-xxs"
                type="button"
                variant="ghost"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "shrink-0",
                  editor.isActive("code") ? "bg-muted" : ""
                )}
                onClick={() =>
                  editor.chain().focus().unsetAllMarks().clearNodes().run()
                }
                size="icon-xxs"
                type="button"
                variant="ghost"
              >
                <RemoveFormatting className="h-4 w-4" />
              </Button>
              {editor.isActive("table") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="gap-x-1"
                      size="xxs"
                      type="button"
                      variant="ghost"
                    >
                      <TableIcon className="h-4 w-4" />
                      <ChevronsUpDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    portalProps={{ container: bubbleMenuRef.current }}
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().addColumnAfter().run()
                      }
                    >
                      Add a column
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                    >
                      Add a row
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().deleteColumn().run()
                      }
                    >
                      <span className="text-red-500">Delete column</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                      <span className="text-red-500">Delete row</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {mediaConfig && editor.isActive("image") && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="shrink-0 text-[0.6rem]"
                      onClick={() =>
                        setImageAlt(editor.getAttributes("image").alt || "")
                      }
                      size="icon-xxs"
                      type="button"
                      variant="ghost"
                    >
                      ALT
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-1">
                    <div className="flex items-center gap-x-1">
                      <Input
                        className="h-8 flex-1"
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Image description"
                        value={imageAlt}
                      />
                      <Button
                        className="shrink-0"
                        onClick={() => {
                          editor
                            .chain()
                            .focus()
                            .updateAttributes("image", { alt: imageAlt })
                            .run();
                        }}
                        size="xxs"
                        type="button"
                        variant="ghost"
                      >
                        Set
                      </Button>
                      <Button
                        className="shrink-0"
                        onClick={() => {
                          editor
                            .chain()
                            .focus()
                            .updateAttributes("image", { alt: "" })
                            .run();
                        }}
                        size="xxs"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} />
        {mediaConfig && (
          <MediaDialog
            extensions={allowedExtensions}
            initialPath={rootPath}
            media={mediaConfig?.name}
            onSubmit={handleMediaDialogSubmit}
            ref={mediaDialogRef}
            selected={[]}
          />
        )}
      </div>
    </>
  );
});

export { EditComponent };
