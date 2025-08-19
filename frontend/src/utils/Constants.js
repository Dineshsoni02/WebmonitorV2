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
