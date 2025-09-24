import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-primary",
        className
      )}
      {...props}
    />
  );
}
