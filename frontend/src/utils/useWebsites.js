import { useEffect, useState, useCallback } from "react";
import { getAllWebsites, getWebsiteStats } from "./ApiCalls";
// LocalStorage helpers
const LOCAL_KEY = "allWebsitesData";

const getWebsitesFromLocal = () =>
  JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

const saveWebsitesToLocal = (websites) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(websites));

// Example DB helpers (you already have these)

const saveWebsiteToDB = async (user, website) => {
  // call your API: POST /websites
};
const deleteWebsiteFromDB = async (user, id) => {
  // call your API: DELETE /websites/:id
};

// Merge helper (deduplicate by URL or id)
const mergeWebsites = (local, db) => {
  const map = new Map();
  [...db, ...local].forEach((w) => map.set(w.url, w));
  return Array.from(map.values());
};

export function useWebsites(user) {
  const [websiteList, setWebsiteList] = useState([]);

  // ✅ Load & sync on mount / user change
  useEffect(() => {
    const loadWebsites = async () => {
      const localWebsites = getWebsitesFromLocal();
      setWebsiteList(localWebsites);

      if (user) {
        try {
          const dbWebsites = await getAllWebsites(user);
          const merged = mergeWebsites(localWebsites, dbWebsites);
          saveWebsitesToLocal(merged);
          setWebsiteList(merged);

          // push missing local → db
          const missing = merged.filter(
            (w) => !dbWebsites.find((d) => d.url === w.url)
          );
          for (const site of missing) {
            await saveWebsiteToDB(user, site);
          }
        } catch (err) {
          console.error("DB sync failed", err);
        }
      }
    };

    loadWebsites();
  }, [user]);

  // ✅ Add website
  const addWebsite = useCallback(
    async (website) => {
      const local = getWebsitesFromLocal();
      const updated = [...local, website];
      saveWebsitesToLocal(updated);
      setWebsiteList(updated);

      if (user) {
        try {
          await saveWebsiteToDB(user, website);
        } catch (err) {
          console.error("Save to DB failed", err);
        }
      }
    },
    [user]
  );

  // ✅ Remove website
  const removeWebsite = useCallback(
    async (website) => {
      const local = getWebsitesFromLocal().filter((w) => w.url !== website.url);
      saveWebsitesToLocal(local);
      setWebsiteList(local);

      if (user && website.id) {
        try {
          await deleteWebsiteFromDB(user, website.id);
        } catch (err) {
          console.error("Delete from DB failed", err);
        }
      }
    },
    [user]
  );

  // ✅ Manual sync trigger
  const syncNow = useCallback(async () => {
    if (!user) return;

    const local = getWebsitesFromLocal();
    try {
      const db = await getAllWebsites(user);
      const merged = mergeWebsites(local, db);
      saveWebsitesToLocal(merged);
      setWebsiteList(merged);

      const missing = merged.filter((w) => !db.find((d) => d.url === w.url));
      for (const site of missing) {
        await saveWebsiteToDB(user, site);
      }
    } catch (err) {
      console.error("Manual sync failed", err);
    }
  }, [user]);

  // ✅ Periodic sync every 5 min
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => syncNow(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, syncNow]);

  return { websiteList, addWebsite, removeWebsite, syncNow };
}
