"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const innerRef = React.useRef<HTMLButtonElement>(null);

  // Handle click to prevent scroll jump
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Find the scrollable parent
      const scrollableParent = e.currentTarget.closest(
        ".overflow-y-auto, .overflow-auto, [data-radix-scroll-area-viewport]"
      );
      const currentScrollTop = scrollableParent?.scrollTop || 0;

      // Call original onClick if provided
      props.onClick?.(e);

      // Restore scroll position after state change
      requestAnimationFrame(() => {
        if (scrollableParent) {
          scrollableParent.scrollTop = currentScrollTop;
        }
      });
    },
    [props.onClick]
  );

  // Handle focus to prevent scroll jump
  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLButtonElement>) => {
      // Find the scrollable parent
      const scrollableParent = e.currentTarget.closest(
        ".overflow-y-auto, .overflow-auto, [data-radix-scroll-area-viewport]"
      );
      const currentScrollTop = scrollableParent?.scrollTop || 0;

      // Call original onFocus if provided
      props.onFocus?.(e);

      // Restore scroll position
      requestAnimationFrame(() => {
        if (scrollableParent) {
          scrollableParent.scrollTop = currentScrollTop;
        }
      });
    },
    [props.onFocus]
  );

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={(node) => {
          // Handle both the forwarded ref and our internal ref
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          innerRef.current = node;
        }}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
        onClick={handleClick}
        onFocus={handleFocus}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
