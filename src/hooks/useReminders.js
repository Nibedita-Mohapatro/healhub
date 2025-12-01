// src/hooks/useReminders.js
import { useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import { useNotification } from "./useNotification";
import { useToast } from "../context/ToastContext";

/**
 * Named export: useReminders
 *
 * - Watches DataContext.state.reminders as source-of-truth.
 * - Runs a short-interval checker (15s) to trigger notifications at the right minute.
 * - Prevents duplicate notifications using a minute-resolution key Set.
 * - Call this hook once at app mount (e.g., in App.jsx or DataProvider).
 */
export function useReminders() {
  const { state } = useData();
  const { requestPermission, notify } = useNotification();
  const toastCtx = useToast();
  const notifiedRef = useRef(new Set());
  const cleanupTimerRef = useRef(null);

  // Helper: produce a minute-resolution key string for a Date
  const minuteKey = (d) => {
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${hh}:${mm}`;
  };

  // Request permission once on mount (safe no-op if already granted/denied)
  useEffect(() => {
    try {
      requestPermission && requestPermission();
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkNow = () => {
      try {
        const reminders = Array.isArray(state?.reminders) ? state.reminders : [];

        const now = new Date();
        const nowKey = minuteKey(now);
        if (!nowKey) return;

        reminders.forEach((r) => {
          if (!r) return;

          // skip disabled / already handled reminders
          if (r.disabled || r.taken || r.skipped) return;

          // accept multiple possible time fields
          const rawTime = r.time ?? r.datetime ?? r.scheduledAt ?? r.date ?? null;
          if (!rawTime) return;
          const remDate = new Date(rawTime);
          if (isNaN(remDate)) return;

          const remKey = minuteKey(remDate);
          if (!remKey) return;

          // only notify if the reminder minute matches current minute
          if (remKey === nowKey) {
            const uniqueId = `${String(r.id ?? r._id ?? r.title)}::${remKey}`;
            if (notifiedRef.current.has(uniqueId)) return;

            // Build notification content
            const title = r.title || r.medicineName || "Reminder";
            const bodyParts = [];
            if (r.medicineName) bodyParts.push(r.medicineName);
            if (r.dosage) bodyParts.push(r.dosage);
            if (r.notes) bodyParts.push(r.notes);
            const body = bodyParts.join(" — ") || (r.description || "It's time for your reminder.");

            // Try Notification API via notify() hook; fallback to toast or console
            try {
              if (typeof notify === "function") {
                notify(title, { body, tag: uniqueId, renotify: false });
              } else if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                // defensive fallback if notify is not provided
                new Notification(title, { body, tag: uniqueId, renotify: false });
              } else {
                throw new Error("notify not available");
              }
            // eslint-disable-next-line no-unused-vars
            } catch (nerr) {
              // fallback to toast if notify fails
              if (toastCtx && typeof toastCtx.addToast === "function") {
                try {
                  toastCtx.addToast({ title, description: body, type: "info", duration: 6000 });
                } catch { /* empty */ }
              } else {
                // final fallback: console
                console.info("Reminder:", title, body);
              }
            }

            // mark as notified for this minute
            notifiedRef.current.add(uniqueId);
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("useReminders check error:", err);
      }
    };

    // initial immediate check
    checkNow();

    // run checker every 15 seconds for responsiveness
    const intervalId = setInterval(() => {
      if (!mounted) return;
      checkNow();
    }, 15_000);

    // clear notified map every 10 minutes so reminders can re-notify later if still relevant
    cleanupTimerRef.current = setInterval(() => {
      notifiedRef.current.clear();
    }, 10 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      if (cleanupTimerRef.current) clearInterval(cleanupTimerRef.current);
      notifiedRef.current.clear();
    };
    // Re-run effect when reminders array reference changes so new reminders are noticed immediately
  }, [state?.reminders, notify, toastCtx]);
}
