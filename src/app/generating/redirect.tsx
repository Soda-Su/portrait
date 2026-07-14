"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

export function GeneratingRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passportId = searchParams.get("passportId");

  useEffect(() => {
    if (!passportId) return;
    const timeout = window.setTimeout(() => {
      router.replace(`/app/passport/${passportId}` as Route);
    }, 1700);
    return () => window.clearTimeout(timeout);
  }, [passportId, router]);

  return null;
}
