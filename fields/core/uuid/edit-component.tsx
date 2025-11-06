"use client";

import { RefreshCcw } from "lucide-react";
import { forwardRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EditComponent = forwardRef(
  (props: any, ref: React.Ref<HTMLInputElement>) => {
    const { value, field, onChange } = props;

    const generateNewUUID = () => {
      onChange(uuidv4());
    };

    return (
      <div className="flex gap-2">
        <Input
          {...props}
          className="text-base"
          readOnly={!field?.options?.editable}
          ref={ref}
        />
        {field?.options?.generate !== false && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="shrink-0"
                  onClick={generateNewUUID}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate new UUID</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
);

export { EditComponent };
