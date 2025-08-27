import { getWebsiteStats } from "./ApiCalls";

export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
  setIsMenuOpen(false);
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

export const recheckAllWebsites = async (setWebsiteList, setIsRechecking) => {
  setIsRechecking(true);

  try {
    const allWebsites = getAllWebsitesFromLocalStorage();
    const updatedWebsites = [];

    for (const website of allWebsites) {
      const data = await getWebsiteStats(website?.data);
      addOrUpdateWebsiteInLocalStorage(data);
      updatedWebsites.push(data);
    }

    setWebsiteList(updatedWebsites);
  } finally {
    setIsRechecking(false);
  }
};
