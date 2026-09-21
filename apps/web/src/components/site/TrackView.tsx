"use client";

import { useEffect } from "react";
import { pushEvent, type TrackingEvent } from "@/lib/analytics";

/** Déclenche un événement de vue au montage (view_job, view_mining_page, view_service…). */
export function TrackView({ event, params }: { event: TrackingEvent; params?: Record<string, unknown> }) {
  useEffect(() => {
    pushEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
