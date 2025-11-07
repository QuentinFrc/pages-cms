"use client";

import { Ban } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CommandsList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
      return true;
    }
    if (event.key === "ArrowDown") {
      setSelectedIndex((selectedIndex + 1) % items.length);
      return true;
    }
    if (event.key === "Enter") {
      selectItem(selectedIndex);
      return true;
    }

    return false;
  };

  const selectItem = (index) => {
    const item = items[index];

    if (item) {
      command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown,
  }));

  return (
    <div
      className="flex flex-col gap-y-0.5 rounded-md border bg-popover p-1 shadow-md"
      ref={containerRef}
    >
      {items.length ? (
        items.map((item, index) => (
          <Button
            className={cn(
              "justify-start gap-x-1.5",
              index === selectedIndex ? "bg-muted" : ""
            )}
            key={index}
            onClick={() => selectItem(index)}
            size="xs"
            variant="ghost"
          >
            <span>{item.icon}</span>
            {item.title}
          </Button>
        ))
      ) : (
        <div className="flex h-8 items-center gap-x-1.5 px-2 text-muted-foreground text-sm">
          <Ban className="h-4 w-4" />
          No result
        </div>
      )}
    </div>
  );
});

export default CommandsList;
