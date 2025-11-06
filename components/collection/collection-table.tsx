"use client";

import {
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type RowData,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleMinus,
  CirclePlus,
  Folder,
  FolderOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

export type TableData = {
  name: string;
  path: string;
  sha?: string;
  content?: string;
  object?: Record<string, any>;
  type: "file" | "dir";
  node?: boolean;
  parentPath?: string;
  subRows?: TableData[];
  fields?: Record<string, any>;
};

const LShapeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4V11C4 12.0609 4.42143 13.0783 5.17157 13.8284C5.92172 14.5786 6.93913 15 8 15H20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export function CollectionTable<TData extends TableData>({
  columns,
  data,
  initialState,
  search,
  setSearch,
  onExpand,
  pathname,
  path,
  isTree = false,
  primaryField,
}: {
  columns: any[];
  data: Record<string, any>[];
  initialState?: Record<string, any>;
  search: string;
  setSearch: (value: string) => void;
  onExpand: (row: any) => Promise<any>;
  pathname: string;
  path: string;
  isTree?: boolean;
  primaryField?: string;
}) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});

  const handleRowExpansion = useCallback(
    async (row: Row<TData>) => {
      const needsLoading =
        row.getCanExpand() &&
        !row.getIsExpanded() &&
        row.original.subRows === undefined;

      if (needsLoading) {
        setLoadingRows((prev) => ({ ...prev, [row.id]: true }));
        try {
          await onExpand(row.original);
        } catch (error) {
          console.error("onExpand failed for row:", row.id, error);
          setLoadingRows((prev) => {
            const newState = { ...prev };
            delete newState[row.id];
            return newState;
          });
          return;
        } finally {
          setLoadingRows((prev) => {
            const newState = { ...prev };
            delete newState[row.id];
            return newState;
          });
        }
      }
      row.toggleExpanded();
    },
    [onExpand]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) =>
      row.original.isNode || row.original.type === "dir",
    getSubRows: (row) => row.subRows,
    state: {
      globalFilter: search,
      expanded,
    },
    onGlobalFilterChange: setSearch,
    onExpandedChange: setExpanded,
  });

  useEffect(() => {
    if (!isTree) return;

    table.getRowModel().rows.forEach((row) => {
      if (
        !row.getIsExpanded() &&
        ((row.original.isNode &&
          row.original.parentPath &&
          path.startsWith(row.original.parentPath)) ||
          (row.original.type === "dir" && path.startsWith(row.original.path)))
      ) {
        handleRowExpansion(row as Row<TData>);
      }
    });
  }, [isTree, path, handleRowExpansion, table, data]);

  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      data,
    }));
  }, [data, table]);

  return (
    <div className="space-y-2">
      <Table className="border-separate border-spacing-0 text-base">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="-top-4 md:-top-6 sticky z-20 bg-background hover:bg-background"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  className={cn(
                    "h-12 cursor-pointer select-none truncate border-b px-3 text-xs first:pl-0 last:cursor-default last:pr-0 hover:bg-muted/50 last:hover:bg-background",
                    header.column.columnDef.meta?.className
                  )}
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  title={
                    header.column.getCanSort()
                      ? header.column.getNextSortingOrder() === "asc"
                        ? "Sort ascending"
                        : header.column.getNextSortingOrder() === "desc"
                          ? "Sort descending"
                          : "Clear sort"
                      : undefined
                  }
                >
                  <div className="flex items-center gap-x-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: <ArrowUp className="h-4 w-4 opacity-50" />,
                      desc: <ArrowDown className="xh-4 w-4 opacity-50" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.original.type === "dir" ? (
                  <>
                    <TableCell
                      className="h-14 border-b px-3 py-0 first:pl-0 last:pr-0"
                      colSpan={columns.length - 1}
                      style={{
                        paddingLeft:
                          row.depth > 0 ? `${row.depth * 2}rem` : undefined,
                      }}
                    >
                      {isTree ? (
                        <button
                          className="flex items-center gap-x-2 font-medium"
                          onClick={() => handleRowExpansion(row as Row<TData>)}
                        >
                          {loadingRows[row.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : row.getIsExpanded() ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <Folder className="h-4 w-4" />
                          )}
                          {row.original.name}
                        </button>
                      ) : (
                        <Link
                          className="flex items-center gap-x-2 font-medium"
                          href={`${pathname}?path=${encodeURIComponent(row.original.path)}`}
                        >
                          <Folder className="h-4 w-4" />
                          {row.original.name}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="h-14 border-b px-3 py-0 first:pl-0 last:pr-0">
                      {(() => {
                        const lastCell =
                          row.getVisibleCells()[
                            row.getVisibleCells().length - 1
                          ];
                        return flexRender(
                          lastCell.column.columnDef.cell,
                          lastCell.getContext()
                        );
                      })()}
                    </TableCell>
                  </>
                ) : (
                  row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className={cn(
                        "h-14 border-b px-3 py-0 first:pl-0 last:pr-0",
                        cell.column.columnDef.meta?.className
                      )}
                      key={cell.id}
                      style={{
                        paddingLeft:
                          cell.column.id === primaryField && row.depth > 0
                            ? `${row.depth * 1.5}rem`
                            : undefined,
                      }}
                    >
                      <div className="flex items-center gap-x-1">
                        {row.depth > 0 && cell.column.id === primaryField && (
                          <LShapeIcon className="h-4 w-4 text-muted-foreground opacity-50" />
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                        {isTree &&
                          row.getCanExpand() &&
                          cell.column.id === primaryField &&
                          (loadingRows[row.id] ? (
                            <Button
                              className="h-6 w-6 rounded-full"
                              disabled
                              size="icon-sm"
                              variant="ghost"
                            >
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </Button>
                          ) : (
                            <Button
                              className="h-6 w-6 rounded-full"
                              disabled={
                                row.getIsExpanded() && row.subRows.length === 0
                              }
                              onClick={() =>
                                handleRowExpansion(row as Row<TData>)
                              }
                              size="icon-sm"
                              variant="ghost"
                            >
                              {row.getIsExpanded() ? (
                                <CircleMinus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              ) : (
                                <CirclePlus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              )}
                              <span className="sr-only">
                                {row.getIsExpanded()
                                  ? "Collapse row"
                                  : "Expand row"}
                              </span>
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  ))
                )}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                className="p-6 text-center text-muted-foreground text-sm"
                colSpan={columns.length}
              >
                <div className="inline-flex items-center justify-center">
                  <Ban className="mr-2 h-4 w-4" />
                  No entries
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {(table.getCanPreviousPage() || table.getCanNextPage()) && (
        <footer className="flex items-center gap-x-2">
          <div className="mr-auto text-muted-foreground text-sm">
            {`Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
          </div>
          <div className="flex">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="ghost"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
