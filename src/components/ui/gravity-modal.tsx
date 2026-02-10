"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface GravityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    trigger?: React.ReactNode;
}

export function GravityModal({ open, onOpenChange, children, title, description, trigger }: GravityModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <AnimatePresence>
                {open && (
                    <DialogPortal forceMount>
                        <DialogOverlay />
                        <DialogPrimitive.Content asChild>
                            <motion.div
                                initial={{ y: -500, opacity: 0, rotate: -5 }}
                                animate={{ 
                                    y: 0, 
                                    opacity: 1, 
                                    rotate: 0,
                                    transition: { 
                                        type: "spring", 
                                        damping: 12, 
                                        stiffness: 100,
                                        mass: 0.8
                                    } 
                                }}
                                exit={{ 
                                    y: 800, 
                                    opacity: 0, 
                                    rotate: 10,
                                    transition: { 
                                        duration: 0.4, 
                                        ease: "easeIn" 
                                    } 
                                }}
                                className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
                                style={{ translateX: "-50%", translateY: "-50%" }} // Framer overrides transform, need to ensure centering logic works
                            >
                                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                                     {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
                                     {description && <p className="text-sm text-muted-foreground">{description}</p>}
                                </div>
                                {children}
                                <DialogPrimitive.Close className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </DialogPrimitive.Close>
                            </motion.div>
                        </DialogPrimitive.Content>
                    </DialogPortal>
                )}
            </AnimatePresence>
        </Dialog>
    );
}
