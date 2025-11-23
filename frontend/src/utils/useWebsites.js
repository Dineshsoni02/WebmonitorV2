import { useEffect, useState, useCallback } from "react";
import { getAllWebsites, getWebsiteStats } from "./ApiCalls";

// LocalStorage helpers
const LOCAL_KEY = "allWebsitesData";

const getWebsitesFromLocal = () =>
  JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

const saveWebsitesToLocal = (websites) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(websites));

export function useWebsites(user) {
  const [websiteList, setWebsiteList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to merge local and DB websites
  const mergeWebsites = useCallback((local, db) => {
    const map = new Map();
    // Add DB websites first (source of truth for ID)
    db.forEach((w) => map.set(w.url, { data: w }));
    
    // Add local websites if not in DB
    local.forEach((w) => {
      if (!map.has(w.data.url)) {
        map.set(w.data.url, w);
      }
    });
    return Array.from(map.values());
  }, []);

  // Sync function
  const syncWebsites = useCallback(async () => {
    setLoading(true);
    const localWebsites = getWebsitesFromLocal();
    
    if (!user) {
      setWebsiteList(localWebsites);
      setLoading(false);
      return;
    }

    try {
      const dbWebsites = await getAllWebsites(user);
      
      // Fetch stats for DB websites to ensure they have 'status', 'ssl', etc.
      const dbWebsitesWithStats = await Promise.all(
        (dbWebsites || []).map(async (site) => {
          try {
            // getWebsiteStats returns { data: { ...stats, url, id } } or similar
            // We need to check what getWebsiteStats returns.
            // It calls POST /guest which returns { status: true, data: { ... } }
            // The helper getWebsiteStats returns data (the whole response? or data.data?)
            // Let's check ApiCalls.js. 
            // It returns `data` which is the whole JSON. So `data.data` is the website info.
            const response = await getWebsiteStats({ url: site.url });
            if (response?.status && response?.data) {
                // Merge DB ID with stats
                return { ...response.data, _id: site._id, id: site._id }; // Ensure ID is preserved
            }
            return site; // Fallback to raw DB object if stats fail (will still lack status)
          } catch (err) {
            console.warn("Failed to fetch stats for DB site", site.url);
            return site;
          }
        })
      );

      const merged = mergeWebsites(localWebsites, dbWebsitesWithStats);
      
      // Identify websites to migrate (in local but not in DB)
      // Note: mergeWebsites prefers DB items (which now have stats).
      // We need to check if local items are NOT in DB.
      // The comparison should be based on URL.
      const websitesToMigrate = localWebsites.filter(
        (local) => !dbWebsites.some((db) => db.url === local.data.url)
      );

      if (websitesToMigrate.length > 0) {
        // Migrate sequentially or in parallel
        await Promise.all(
          websitesToMigrate.map(async (site) => {
            try {
              await fetch("http://localhost:5000/migrate", {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                  Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
                },
                body: JSON.stringify({ websites: [site.data] }),
              });
            } catch (err) {
              console.error("Migration failed for", site.data.url, err);
            }
          })
        );
        
        // Re-fetch after migration to get IDs
        const updatedDbWebsites = await getAllWebsites(user);
        // Also fetch stats for these new ones? Or just re-sync?
        // Let's just re-fetch stats for all to be safe and consistent, 
        // or just fetch stats for the new ones. 
        // Simpler: Just call syncWebsites recursively? No, infinite loop risk.
        // Let's just use the stats we have for local ones (which are already in localWebsites)
        // and merge with updated DB IDs.
        
        // Actually, simpler approach:
        // We already have `merged` which contains DB sites (with stats) + Local sites (with stats).
        // We just migrated the local ones. 
        // We just need to update the IDs of the local ones in `merged` with the new DB IDs.
        
        const idMap = new Map();
        updatedDbWebsites.forEach(w => idMap.set(w.url, w._id));
        
        const finalMerged = merged.map(item => {
            if (idMap.has(item.data.url)) {
                return { data: { ...item.data, id: idMap.get(item.data.url), _id: idMap.get(item.data.url) } };
            }
            return item;
        });

        setWebsiteList(finalMerged);
        saveWebsitesToLocal(finalMerged);
      } else {
        setWebsiteList(merged);
        saveWebsitesToLocal(merged);
      }
    } catch (err) {
      console.error("Sync failed", err);
      // Fallback to local if sync fails
      setWebsiteList(localWebsites);
    } finally {
      setLoading(false);
    }
  }, [user, mergeWebsites]);

  // Initial load and sync
  useEffect(() => {
    syncWebsites();
  }, [syncWebsites]);

  // Add Website
  const addWebsite = useCallback(async (websiteData) => {
    // 1. Update Local State & Storage immediately
    const newWebsiteObj = { data: websiteData };
    const currentList = getWebsitesFromLocal();
    
    // Check duplicates
    if (currentList.some(w => w.data.url === websiteData.url)) {
      return { error: "Website already exists" };
    }

    const updatedList = [...currentList, newWebsiteObj];
    saveWebsitesToLocal(updatedList);
    setWebsiteList(updatedList);

    // 2. If user logged in, save to DB
    if (user) {
      try {
        await fetch("http://localhost:5000/migrate", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
            },
            body: JSON.stringify({ websites: [websiteData] }),
          });
          // Optionally re-sync to get the ID from DB, but for now local ID is fine until next sync
          syncWebsites(); 
      } catch (err) {
        console.error("Failed to save to DB", err);
        // Don't revert local state, just log error. It will sync next time.
      }
    }
    return { success: true };
  }, [user, syncWebsites]);

  // Remove Website
  const removeWebsite = useCallback(async (id) => {
    // 1. Update Local State & Storage immediately
    const currentList = getWebsitesFromLocal();
    const websiteToRemove = currentList.find(w => w.data.id === id || w.data._id === id); // Handle both ID types if mixed
    
    // Filter out by ID
    const updatedList = currentList.filter(w => w.data.id !== id && w.data._id !== id);
    saveWebsitesToLocal(updatedList);
    setWebsiteList(updatedList);

    // 2. If user logged in, delete from DB
    if (user) {
        // We need the DB ID. If the local list has it (from sync), great.
        // If it's a guest site migrated, it might have a different ID structure? 
        // Usually sync ensures we have the DB ID.
        try {
            await fetch(`http://localhost:5000/website/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
                },
            });
        } catch (err) {
            console.error("Failed to delete from DB", err);
            // Revert? No, just log.
        }
    }
  }, [user]);

  // Recheck all websites (uptime, stats)
  const recheckWebsites = useCallback(async () => {
    setLoading(true);
    const currentList = getWebsitesFromLocal();
    
    try {
      // We can use p-limit if we want, but for now Promise.all is fine or sequential
      // Let's use Promise.all
      const updatedList = await Promise.all(
        currentList.map(async (item) => {
          try {
            const data = await getWebsiteStats(item.data);
            return { data };
          } catch (err) {
            console.error("Failed to recheck", item.data.url, err);
            return item;
          }
        })
      );
      
      saveWebsitesToLocal(updatedList);
      setWebsiteList(updatedList);
      
      // If user is logged in, maybe we should update DB? 
      // But DB usually stores configuration, not realtime stats? 
      // The previous implementation didn't seem to update DB with stats, only local.
      // But wait, guestWebsite returns stats.
      // If we want to persist stats to DB, we need an endpoint for that.
      // For now, we just update local state which drives the UI.
      
    } catch (err) {
      console.error("Recheck failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { websiteList, loading, addWebsite, removeWebsite, syncWebsites, recheckWebsites };
}
