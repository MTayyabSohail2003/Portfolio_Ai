"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((item) => item !== "");

  if (pathname === "/") return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center">
      <ol className="flex items-center space-x-2">
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </motion.li>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const title = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <motion.li
              key={href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
              className="flex items-center space-x-2"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {isLast ? (
                <span className="font-medium text-foreground cursor-default">
                  {title}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {title}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
