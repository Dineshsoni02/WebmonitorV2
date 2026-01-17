import { useEffect, useState, useCallback } from "react";
import { getAllWebsites, getWebsiteStats, getGuestWebsites, deleteGuestWebsite, deleteWebsite } from "./ApiCalls";
import { useToast } from "../context/ToastContext";
import { getVisitorToken } from "./useVisitorToken";

// LocalStorage helpers (for caching purposes only now)
const LOCAL_KEY = "allWebsitesData";

const getWebsitesFromLocal = () =>
  JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

const saveWebsitesToLocal = (websites) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(websites));

export function useWebsites(user, isTokenLoading = false, handleSessionInvalid = null) {
  const [websiteList, setWebsiteList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Helper to merge local cache and DB websites
  const mergeWebsites = useCallback((local, db) => {
    const map = new Map();
    // Add DB websites first (source of truth for ID)
    db.forEach((w) => map.set(w.url, { data: w }));
    
    // Add local websites if not in DB (fallback cache)
    local.forEach((w) => {
      if (!map.has(w.data?.url || w.url)) {
        map.set(w.data?.url || w.url, w.data ? w : { data: w });
      }
    });
    return Array.from(map.values());
  }, []);

  // Sync function - DB is the sole source of truth for both guests and users
  const syncWebsites = useCallback(async () => {
    setLoading(true);
    
    try {
      let dbWebsites = [];
      
      if (user) {
        // Authenticated user: fetch from user's websites
        dbWebsites = await getAllWebsites(user) || [];
      } else {
        // Guest user: fetch from DB using visitor token
        const visitorToken = getVisitorToken();
        if (visitorToken) {
          dbWebsites = await getGuestWebsites() || [];
        }
      }

      // DB is the sole source of truth - no merge with localStorage
      // This ensures data is always consistent across tabs/windows
      const websitesWithStats = dbWebsites.map(site => ({
        data: {
          ...site,
          id: site._id || site.id,
          _id: site._id || site.id,
        }
      }));
      
      setWebsiteList(websitesWithStats);
      
    } catch (err) {
      
      // Handle session invalidation (logged in from another browser/device)
      if (err.isSessionInvalid && handleSessionInvalid) {
        handleSessionInvalid("You have been logged out because you logged in from another browser/device.");
        return;
      }
      
      // Fallback to local cache only if API fails
      const localCache = getWebsitesFromLocal();
      if (localCache.length > 0) {
        setWebsiteList(localCache);
      }
      addToast("Failed to sync websites", "error");
    } finally {
      setLoading(false);
    }
  }, [user, addToast, handleSessionInvalid]);

  // Initial load and sync - wait for token to be ready before syncing
  useEffect(() => {
    // If token is still loading as guest, wait
    if (!user && isTokenLoading) {
      return;
    }
    syncWebsites();
  }, [syncWebsites, user, isTokenLoading]);

  // Add Website - now saved to DB for both guests and users
  const addWebsite = useCallback(async (websiteData) => {
    // Check duplicates using current state (not localStorage)
    const existingUrl = websiteData.url;
    if (websiteList.some(w => (w.data?.url || w.url) === existingUrl)) {
      addToast("Website already exists", "warning");
      return { error: "Website already exists" };
    }

    // For guests: The guestWebsite endpoint already saves to DB with visitor token
    // For users: We need to migrate to user's account
    const newWebsiteObj = { data: websiteData };
    const updatedList = [...websiteList, newWebsiteObj];
    
    // Update state immediately for UI responsiveness
    setWebsiteList(updatedList);
    addToast("Website added successfully", "success");

    // If user is logged in, also save to their account
    if (user) {
      console.log("=== FRONTEND MIGRATE DEBUG ===");
      console.log("User detected, calling /migrate");
      try {
        // Ensure we have the required properties for migration
        const websiteToMigrate = {
          id: websiteData.id || websiteData._id || crypto.randomUUID(),
          url: websiteData.url,
          name: websiteData.name || websiteData.websiteName || new URL(websiteData.url).hostname,
        };
        
        console.log("Website to migrate:", websiteToMigrate);
        console.log("Token:", user?.tokens?.accessToken?.token?.substring(0, 20) + "...");
        
        const response = await fetch("http://localhost:5000/migrate", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
          },
          body: JSON.stringify({ websites: [websiteToMigrate] }),
        });
        
        const data = await response.json();
        console.log("Migrate response:", data);
        if (data.status && data.data && data.data.length > 0) {
          const savedWebsite = data.data[0];
          
          // Update state with the new DB ID
          setWebsiteList(prev => prev.map(w => {
            if ((w.data?.url || w.url) === websiteData.url) {
              return { data: { ...w.data, id: savedWebsite._id, _id: savedWebsite._id } };
            }
            return w;
          }));
        }
      } catch (err) {
        addToast("Failed to sync to server", "error");
      }
    }
    
    return { success: true };
  }, [user, addToast, websiteList]);

  // Remove Website - works for both guests and users
  const removeWebsite = useCallback(async (id) => {
    // Filter out by ID using current state (not localStorage)
    const updatedList = websiteList.filter(w => {
      const itemId = w.data?.id || w.data?._id || w.id || w._id;
      return itemId !== id;
    });
    setWebsiteList(updatedList);
    addToast("Website removed", "info");

    // Delete from DB
    try {
      if (user) {
        // Authenticated user
        await deleteWebsite(id, user);
      } else {
        // Guest user
        await deleteGuestWebsite(id);
      }
    } catch (err) {
      addToast("Failed to delete from server", "error");
    }
  }, [user, addToast, websiteList]);

  // Recheck all websites (manual refresh)
  const recheckWebsites = useCallback(async () => {
    setLoading(true);
    
    try {
      // Use current state (not localStorage)
      const updatedList = await Promise.all(
        websiteList.map(async (item) => {
          try {
            const websiteData = item.data || item;
            const response = await getWebsiteStats({
              url: websiteData.url,
              id: websiteData.id || websiteData._id,
              name: websiteData.name || websiteData.websiteName,
            });
            if (response?.status && response?.data) {
              return { data: response.data };
            }
            return item;
          } catch (err) {
            return item;
          }
        })
      );
      
      setWebsiteList(updatedList);
      addToast("Websites rechecked", "success");
      
    } catch (err) {
      addToast("Failed to recheck websites", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, websiteList]);

  return { websiteList, loading, addWebsite, removeWebsite, syncWebsites, recheckWebsites };
}

