"use client";

import { useEffect, useState } from "react";

import { formatDuration } from "@/lib/utils";

export function Timer({ initialSeconds, paused = false }: { initialSeconds: number; paused?: boolean }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paused]);

  return <span>{formatDuration(seconds)}</span>;
}
