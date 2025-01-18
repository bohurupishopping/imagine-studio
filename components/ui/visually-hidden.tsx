"use client";

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export interface VisuallyHiddenProps extends ComponentPropsWithoutRef<"div"> {}

const VisuallyHidden = forwardRef<HTMLDivElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute",
        "w-px",
        "h-px",
        "p-0",
        "m-[-1px]",
        "overflow-hidden",
        "clip-[rect(0,0,0,0)]",
        "whitespace-nowrap",
        "border-0",
        className
      )}
      {...props}
    />
  )
);

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
