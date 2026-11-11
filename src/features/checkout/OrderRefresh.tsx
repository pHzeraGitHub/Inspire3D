"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function OrderRefresh() {
  const router = useRouter();
  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 15000);
    return () => window.clearInterval(interval);
  }, [router]);
  return null;
}
