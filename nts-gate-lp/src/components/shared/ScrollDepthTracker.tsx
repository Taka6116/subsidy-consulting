"use client";

import { useScrollDepth } from "@/lib/analytics";

export default function ScrollDepthTracker() {
  useScrollDepth();
  return null;
}
