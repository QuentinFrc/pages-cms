"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
} from "@/components/ui/combobox";

import { DynamicIcon, iconNames } from "lucide-react/dynamic";

import { formatIconLabel, isIconName } from "./icons";

type IconOption = {
  value: string;
  label: string;
};

const OPTIONS: IconOption[] = iconNames.map((name) => ({
  value: name,
  label: formatIconLabel(name),
}));

const CELL_SIZE = 40;
const GAP = 4;
const ROW_HEIGHT = CELL_SIZE + GAP;

const filterOptions = (query: string): IconOption[] => {
  const q = query.trim().toLowerCase();
  if (!q) return OPTIONS;
  return OPTIONS.filter(
    (option) =>
      option.value.includes(q) || option.label.toLowerCase().includes(q),
  );
};

const EditComponent = forwardRef<HTMLInputElement, any>(
  ({ value, onChange, field, className, disabled }, ref) => {
    const isReadonly = Boolean(field?.readonly) || Boolean(disabled);

    const selectedOption = useMemo(() => {
      if (typeof value !== "string" || value.length === 0) return null;
      return (
        OPTIONS.find((option) => option.value === value) ?? {
          value,
          label: formatIconLabel(value),
        }
      );
    }, [value]);

    const placeholder =
      (field?.options?.placeholder as string | undefined) || "Search icons…";

    const handleValueChange = (nextValue: IconOption | null) => {
      if (isReadonly) return;
      if (!nextValue) {
        onChange(field?.required ? undefined : null);
        return;
      }
      onChange(nextValue.value);
    };

    const [query, setQuery] = useState("");

    const filteredOptions = useMemo(() => {
      if (selectedOption && query === selectedOption.label) return OPTIONS;
      return filterOptions(query);
    }, [query, selectedOption]);

    return (
      <Combobox
        items={OPTIONS}
        filteredItems={filteredOptions}
        value={selectedOption as any}
        onValueChange={handleValueChange as any}
        onInputValueChange={setQuery}
        readOnly={isReadonly}
        isItemEqualToValue={(item, selected) => item?.value === selected?.value}
        virtualized
        grid
        autoHighlight
      >
        <ComboboxInput
          ref={ref}
          placeholder={placeholder}
          className={cn(className)}
          showTrigger={!isReadonly}
          readOnly={isReadonly}
        />
        <ComboboxContent className="w-[min(28rem,calc(100vw-2rem))] min-w-(--anchor-width)">
          <ComboboxEmpty>No icons found.</ComboboxEmpty>
          <VirtualIconGrid options={filteredOptions} />
        </ComboboxContent>
      </Combobox>
    );
  },
);

const VirtualIconGrid = ({ options }: { options: IconOption[] }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(1);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth - 8;
      const next = Math.max(
        1,
        Math.floor((width + GAP) / (CELL_SIZE + GAP)),
      );
      setCols((prev) => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowCount = Math.ceil(options.length / cols);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [cols, options, virtualizer]);

  const totalSize = virtualizer.getTotalSize();

  return (
    <ComboboxPrimitive.List
      ref={scrollRef}
      data-slot="combobox-list"
      className="max-h-[min(22.5rem,calc(var(--available-height)-2.25rem))] overflow-y-auto p-1 data-empty:hidden"
    >
      <div
        style={{
          height: totalSize,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((vRow) => {
          const rowStart = vRow.index * cols;
          const rowItems = options.slice(rowStart, rowStart + cols);
          return (
            <ComboboxPrimitive.Row
              key={vRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: `${GAP}px`,
                paddingBottom: `${GAP}px`,
              }}
            >
              {rowItems.map((option, i) => (
                <ComboboxItem
                  key={option.value}
                  value={option}
                  index={rowStart + i}
                  className="aspect-square flex items-center justify-center rounded-sm p-0 data-[selected]:ring-1 data-[selected]:ring-ring [&_[data-slot=combobox-item-indicator]]:hidden"
                  aria-label={option.label}
                  title={option.label}
                >
                  {isIconName(option.value) ? (
                    <DynamicIcon name={option.value} className="size-4" />
                  ) : (
                    <span className="text-xs">{option.value.slice(0, 2)}</span>
                  )}
                </ComboboxItem>
              ))}
            </ComboboxPrimitive.Row>
          );
        })}
      </div>
    </ComboboxPrimitive.List>
  );
};

EditComponent.displayName = "IconFieldEditComponent";

export { EditComponent };
