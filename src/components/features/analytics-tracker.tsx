"use client";

import { useEffect, useRef } from "react";

export function AnalyticsTracker() {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double counting in Strict Mode or re-renders
    if (initialized.current) return;
    initialized.current = true;

    // Simple fire-and-forget
    fetch("/api/analytics/view", { method: "POST" }).catch((err) => 
      console.error("Analytics error:", err)
    );
  }, []);

  return null;
}
