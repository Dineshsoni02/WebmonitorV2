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
