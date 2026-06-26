"use client";

import { useEffect, useState } from "react";

import { formatDuration } from "@/lib/utils";

export function Timer({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return <span>{formatDuration(seconds)}</span>;
}
