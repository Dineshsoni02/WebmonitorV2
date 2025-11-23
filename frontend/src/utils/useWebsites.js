import { useEffect, useState, useCallback } from "react";
import { getAllWebsites, getWebsiteStats } from "./ApiCalls";
import { useToast } from "../context/ToastContext";

// LocalStorage helpers
const LOCAL_KEY = "allWebsitesData";

const getWebsitesFromLocal = () =>
  JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

const saveWebsitesToLocal = (websites) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(websites));

export function useWebsites(user) {
  const [websiteList, setWebsiteList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

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
      
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      const dbWebsitesWithStats = await Promise.all(
        (dbWebsites || []).map(async (site) => {
          try {
            // Check if we have cached stats for this URL
            const cached = localWebsites.find(w => w.data.url === site.url);
            const cacheAge = cached?.data?.lastChecked 
              ? now - new Date(cached.data.lastChecked).getTime() 
              : Infinity;
            
            // If cache is fresh (< 5 min), use it
            if (cached && cacheAge < CACHE_DURATION && cached.data.status) {
              console.log("Using cached stats for", site.url);
              return { ...cached.data, _id: site._id, id: site._id };
            }
            
            // Otherwise fetch fresh stats
            console.log("Fetching fresh stats for", site.url);
            const response = await getWebsiteStats({ url: site.url, id: site._id });
            if (response?.status && response?.data) {
                return { ...response.data, _id: site._id, id: site._id };
            }
            return site;
          } catch (err) {
            console.warn("Failed to fetch stats for DB site", site.url);
            return site;
          }
        })
      );

      const merged = mergeWebsites(localWebsites, dbWebsitesWithStats);
      
      // Identify websites to migrate
      const websitesToMigrate = localWebsites.filter(
        (local) => !dbWebsites.some((db) => db.url === local.data.url)
      );

      if (websitesToMigrate.length > 0) {
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
        
        const updatedDbWebsites = await getAllWebsites(user);
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
      addToast("Failed to sync websites", "error");
    } finally {
      setLoading(false);
    }
  }, [user, mergeWebsites, addToast]);

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
      addToast("Website already exists", "warning");
      return { error: "Website already exists" };
    }

    const updatedList = [...currentList, newWebsiteObj];
    saveWebsitesToLocal(updatedList);
    setWebsiteList(updatedList);
    addToast("Website added successfully", "success");

    // 2. If user logged in, save to DB
    if (user) {
      try {
        const response = await fetch("http://localhost:5000/migrate", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
            },
            body: JSON.stringify({ websites: [websiteData] }),
          });
          
          const data = await response.json();
          if (data.status && data.data && data.data.length > 0) {
              const savedWebsite = data.data[0];
              console.log("Saved to DB, got ID:", savedWebsite._id);
              
              // Update local list with the new DB ID immediately
              const listWithId = updatedList.map(w => {
                  if (w.data.url === websiteData.url) {
                      return { data: { ...w.data, id: savedWebsite._id, _id: savedWebsite._id } };
                  }
                  return w;
              });
              saveWebsitesToLocal(listWithId);
              setWebsiteList(listWithId);
          }
      } catch (err) {
        console.error("Failed to save to DB", err);
        addToast("Failed to sync to server", "error");
      }
    }
    return { success: true };
  }, [user, addToast]);

  // Remove Website
  const removeWebsite = useCallback(async (id) => {
    console.log("Removing website with ID:", id);
    // 1. Update Local State & Storage immediately
    const currentList = getWebsitesFromLocal();
    
    // Filter out by ID
    const updatedList = currentList.filter(w => w.data.id !== id && w.data._id !== id);
    saveWebsitesToLocal(updatedList);
    setWebsiteList(updatedList);
    addToast("Website removed", "info");

    // 2. If user logged in, delete from DB
    if (user) {
        try {
            console.log("Deleting from DB:", id);
            const res = await fetch(`http://localhost:5000/website/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
                },
            });
            console.log("Delete response:", res.status);
            if (!res.ok) {
                throw new Error("Failed to delete");
            }
        } catch (err) {
            console.error("Failed to delete from DB", err);
            addToast("Failed to delete from server", "error");
        }
    }
  }, [user, addToast]);

  // Recheck all websites (uptime, stats)
  const recheckWebsites = useCallback(async () => {
    setLoading(true);
    const currentList = getWebsitesFromLocal();
    
    try {
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
      addToast("Websites rechecked", "success");
      
    } catch (err) {
      console.error("Recheck failed", err);
      addToast("Failed to recheck websites", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return { websiteList, loading, addWebsite, removeWebsite, syncWebsites, recheckWebsites };
}
