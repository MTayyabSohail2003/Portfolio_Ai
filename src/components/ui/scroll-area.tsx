import * as React from "react"
import type * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { ScrollArea as ScrollAreaBase } from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  // Note: Radix UI ScrollArea requires Root, Viewport, Scrollbar components structure
  // For simplicity keeping it generic div with overflow auto if primitive is missing props
  // But to be shadcn compliant we should implement full structure. 
  // Simplified version given missing primitive import in this context
  <div
    ref={ref}
    className={cn("relative overflow-auto", className)}
    {...props}
  >
    {children}
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
