// src/hooks/useReminders.js
import { useEffect, useRef } from "react";
import storage from "../utils/storage"; // your storage wrapper
import { STORAGE_KEYS } from "../constants/storageKeys";
import { useNotification } from "./useNotification";
import { useToast } from "../context/ToastContext";

/**
 * useReminders
 * - Polls reminders from storage every minute and triggers notifications
 * - Avoids duplicate notifications within same minute using a Set
 *
 * Note: This hook reads directly from storage to pick up changes by other components.
 * Mount it once (e.g., inside DataProvider or App).
 */
export function useReminders() {
  const seenRef = useRef(new Set());
  const { notify } = useNotification();
  const toastCtx = useToast();

  useEffect(() => {
    let mounted = true;

    const checkOnce = async () => {
      try {
        const reminders = (await storage.getItem(STORAGE_KEYS.REMINDERS)) || [];
        const now = new Date();
        const hh = now.getHours();
        const mm = now.getMinutes();

        reminders.forEach(r => {
          if (!r || r.taken || r.skipped) return;
          const rTime = new Date(r.time || r.datetime || r.date || r.scheduledAt);
          if (isNaN(rTime)) return;
          if (rTime.getHours() === hh && rTime.getMinutes() === mm) {
            // unique key per reminder + minute window
            const key = `${r.id}_${hh}_${mm}`;
            if (seenRef.current.has(key)) return;
            seenRef.current.add(key);

            // notify - use Notification API if possible, fallback to toast
            const body = r.medicineName ? `${r.medicineName} — ${r.dosage || ""}` : (r.title || "Time for your reminder");
            notify(r.title || "Reminder", { body }, (title, opts) => {
              // fallback: add toast via context
              try { toastCtx.addToast({ title, description: opts.body, type: "info", duration: 5000 }); } catch { /* empty */ }
            });
          }
        });
      } catch (e) {
        console.warn("useReminders check error", e);
      }
    };

    // initial check
    checkOnce();

    const id = setInterval(() => { if (mounted) checkOnce(); }, 60_000);

    // clear seen keys each minute + on unmount to avoid memory buildup
    const clearId = setInterval(() => seenRef.current.clear(), 61_000);

    return () => {
      mounted = false;
      clearInterval(id);
      clearInterval(clearId);
    };
  }, [notify, toastCtx]);
}
