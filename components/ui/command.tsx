"use client";

import * as React from "react";
import {Command as CommandPrimitive} from "cmdk";

import {cn} from "@/lib/utils";

export const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  function Command({className, ...props}, ref) {
    return <CommandPrimitive ref={ref} className={cn("flex h-full w-full flex-col overflow-hidden rounded-xl", className)} {...props} />;
  },
);

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({className, ...props}, ref) {
  return <CommandPrimitive.Input ref={ref} className={cn("flex h-11 w-full border-b border-border bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted", className)} {...props} />;
});

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({className, ...props}, ref) {
  return <CommandPrimitive.List ref={ref} className={cn("max-h-72 overflow-y-auto overflow-x-hidden", className)} {...props} />;
});

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({className, ...props}, ref) {
  return <CommandPrimitive.Empty ref={ref} className={cn("px-3 py-6 text-center text-sm text-muted", className)} {...props} />;
});

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({className, ...props}, ref) {
  return <CommandPrimitive.Group ref={ref} className={cn("p-1 text-text", className)} {...props} />;
});

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(function CommandItem({className, ...props}, ref) {
  return <CommandPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none aria-selected:bg-surface aria-selected:text-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props} />;
});

export const CommandSeparator = CommandPrimitive.Separator;
