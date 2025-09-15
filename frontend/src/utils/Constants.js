import { getWebsiteStats } from "./ApiCalls";
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

export const removeWebsiteFromLocalStorage = (url) => {
  const allWebsites = getAllWebsitesFromLocalStorage();
  const updatedWebsites = allWebsites.filter((item) => item?.data?.url !== url);
  localStorage.setItem("allWebsitesData", JSON.stringify(updatedWebsites));
  window.location.reload();
};

export const addOrUpdateWebsiteInLocalStorage = (data) => {
  if (!data || !data?.data?.url) return;

  let allWebsites = getAllWebsitesFromLocalStorage();

  const index = allWebsites.findIndex((w) => w?.data?.url === data?.data?.url);
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

