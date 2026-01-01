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

export function useWebsites(user) {
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

  // Sync function - now DB is source of truth for both guests and users
  const syncWebsites = useCallback(async () => {
    setLoading(true);
    const localCache = getWebsitesFromLocal();
    
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

      // DB websites already have stored SSL/SEO data - no need to fetch fresh stats
      // This implements the "fast reads" pattern from the roadmap
      const websitesWithStats = dbWebsites.map(site => ({
        ...site,
        id: site._id || site.id,
        _id: site._id || site.id,
      }));

      const merged = mergeWebsites(localCache, websitesWithStats);
      
      setWebsiteList(merged);
      saveWebsitesToLocal(merged);
      
    } catch (err) {
      console.error("Sync failed", err);
      // Fallback to local cache if sync fails
      setWebsiteList(localCache);
      addToast("Failed to sync websites", "error");
    } finally {
      setLoading(false);
    }
  }, [user, mergeWebsites, addToast]);

  // Initial load and sync
  useEffect(() => {
    syncWebsites();
  }, [syncWebsites]);

  // Add Website - now saved to DB for both guests and users
  const addWebsite = useCallback(async (websiteData) => {
    const currentList = getWebsitesFromLocal();
    
    // Check duplicates
    const existingUrl = websiteData.url;
    if (currentList.some(w => (w.data?.url || w.url) === existingUrl)) {
      addToast("Website already exists", "warning");
      return { error: "Website already exists" };
    }

    // For guests: The guestWebsite endpoint already saves to DB with visitor token
    // For users: We need to migrate to user's account
    const newWebsiteObj = { data: websiteData };
    const updatedList = [...currentList, newWebsiteObj];
    
    saveWebsitesToLocal(updatedList);
    setWebsiteList(updatedList);
    addToast("Website added successfully", "success");

    // If user is logged in, also save to their account
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
          
          // Update local list with the new DB ID
          const listWithId = updatedList.map(w => {
            if ((w.data?.url || w.url) === websiteData.url) {
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

  // Remove Website - works for both guests and users
  const removeWebsite = useCallback(async (id) => {
    console.log("Removing website with ID:", id);
    const currentList = getWebsitesFromLocal();
    
    // Filter out by ID
    const updatedList = currentList.filter(w => {
      const itemId = w.data?.id || w.data?._id || w.id || w._id;
      return itemId !== id;
    });
    saveWebsitesToLocal(updatedList);
    setWebsiteList(updatedList);
    addToast("Website removed", "info");

    // Delete from DB
    try {
      if (user) {
        // Authenticated user
        console.log("Deleting from user DB:", id);
        await deleteWebsite(id, user);
      } else {
        // Guest user
        console.log("Deleting from guest DB:", id);
        await deleteGuestWebsite(id);
      }
    } catch (err) {
      console.error("Failed to delete from DB", err);
      addToast("Failed to delete from server", "error");
    }
  }, [user, addToast]);

  // Recheck all websites (manual refresh)
  const recheckWebsites = useCallback(async () => {
    setLoading(true);
    const currentList = getWebsitesFromLocal();
    
    try {
      const updatedList = await Promise.all(
        currentList.map(async (item) => {
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
            console.error("Failed to recheck", item.data?.url || item.url, err);
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

