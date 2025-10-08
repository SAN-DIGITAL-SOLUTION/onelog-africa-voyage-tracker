import * as React from "react";

import { cn } from "@/lib/utils";

import { badgeVariants, type BadgeVariantProps } from "./variants";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BadgeVariantProps {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
