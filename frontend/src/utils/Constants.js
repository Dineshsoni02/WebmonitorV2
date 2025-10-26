import { getWebsiteStats, getAllWebsites, migrateGuestWebsites } from "./ApiCalls";
import pLimit from "p-limit";

export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export const getAllWebsitesFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("allWebsitesData")) || [];
};

const allWebsites = getAllWebsitesFromLocalStorage() || [];

export const alreadyExists = (url) => {
  return allWebsites.some((item) => item?.data?.url === url);
};

export const addWebsiteToLocalStorage = (data) => {
  if (!data || !data?.data?.url) {
    return;
  }

  allWebsites.push(data);
  localStorage.setItem("allWebsitesData", JSON.stringify(allWebsites));
};

export const removeWebsiteFromLocalStorage = (id) => {
  const allWebsites = getAllWebsitesFromLocalStorage();
  const updatedWebsites = allWebsites.filter((item) => item?.data?.id !== id);
  localStorage.setItem("allWebsitesData", JSON.stringify(updatedWebsites));
  window.location.reload();
};

export const addOrUpdateWebsiteInLocalStorage = (data) => {
  if (!data || !data?.data?.url) return;

  let allWebsites = getAllWebsitesFromLocalStorage();

  const index = allWebsites.findIndex((w) => w?.data?.id === data?.data?.id);
  if (index > -1) {
    allWebsites[index] = data;
  } else {
    allWebsites.push(data);
  }

  localStorage.setItem("allWebsitesData", JSON.stringify(allWebsites));
};

// export const recheckAllWebsites = async (setWebsiteList, setIsRechecking) => {
//   setIsRechecking(true);

//   try {
//     const allWebsites = getAllWebsitesFromLocalStorage();
//     const updatedWebsites = [];

//     for (const website of allWebsites) {
//       const data = await getWebsiteStats(website?.data);
//       addOrUpdateWebsiteInLocalStorage(data);
//       updatedWebsites.push(data);
//     }

//     setWebsiteList(updatedWebsites);
//   } finally {
//     setIsRechecking(false);
//   }
// };

// export const recheckAllWebsites = async (setWebsiteList, setIsRechecking) => {
//   setIsRechecking(true);

//   try {
//     const allWebsites = getAllWebsitesFromLocalStorage();

//     const updatedWebsites = await Promise.all(
//       allWebsites.map(async (website) => {
//         try {
//           const data = await getWebsiteStats(website?.data);
//           addOrUpdateWebsiteInLocalStorage(data);
//           return data;
//         } catch (err) {
//           console.error(`Failed to fetch stats for ${website?.data?.url}`, err);
//           return website;
//         }
//       })
//     );

//     setWebsiteList(updatedWebsites);
//   } finally {
//     setIsRechecking(false);
//   }
// };

export const recheckAllWebsites = async (setWebsiteList, setIsRechecking) => {
  setIsRechecking(true);

  try {
    const allWebsites = getAllWebsitesFromLocalStorage();
    const limit = pLimit(5); // max 5 requests at a time

    const tasks = allWebsites.map((website) =>
      limit(async () => {
        const data = await getWebsiteStats(website?.data);
        addOrUpdateWebsiteInLocalStorage(data);
        return data;
      })
    );

    const updatedWebsites = await Promise.all(tasks);
    setWebsiteList(updatedWebsites);
  } finally {
    setIsRechecking(false);
  }
};

export const syncWebsites = async (user, token, setErrorMessage) => {
  try {
    // Step 1: Get local + DB websites
    const localWebsites = getAllWebsitesFromLocalStorage() || [];
    const dbWebsites = (await getAllWebsites(user)) || [];
    // console.log("dbWebsites", dbWebsites);

    const dbWebsiteStats = await Promise.all(
      dbWebsites.map(async (item) => {
        try {
          const stats = await getWebsiteStats(item);
          return stats;
        } catch (error) {
          console.warn("Error fetching stats for website:", item?.url, error);
          return item;
        }
      })
    );

    const allWebsitesMap = new Map();

    // Add DB websites first
    dbWebsiteStats.forEach( (item) => {
      console.log("item", item);
      const key = item?.data?.id || item?.data?.url;
      if (key) allWebsitesMap.set(key, item);
    });

    // Add local websites if not already in DB
    localWebsites.forEach((item) => {
      const key = item?.id || item?.data?.url;
      if (key && !allWebsitesMap.has(key)) {
        allWebsitesMap.set(key, item);
      }
    });

    const mergedWebsites = Array.from(allWebsitesMap.values());

    console.log("mergedWebsites", mergedWebsites);
    // Step 3: Find which local websites are not yet in DB (need to migrate)
    const newWebsites = localWebsites.filter(
      (localItem) => !dbWebsites.some((dbItem) => dbItem?.id === localItem?.id)
    );

    // Step 4: Migrate new local websites to DB
    if (newWebsites.length > 0) {
      console.log("🆕 Migrating new websites:", newWebsites);
      await migrateGuestWebsites(newWebsites, token, setErrorMessage);
    }

    // Step 5: Update localStorage to ensure it matches merged state
    localStorage.setItem("allWebsitesData", JSON.stringify(mergedWebsites));

    console.log("✅ Sync complete — merged websites:", mergedWebsites);
    return mergedWebsites;
  } catch (err) {
    console.error("❌ Error syncing websites:", err);
    setErrorMessage?.(err.message || "Failed to sync websites");
    return [];
  }
};
