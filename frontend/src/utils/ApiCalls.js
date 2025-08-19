export const getWebsiteStats = async (websiteInfo) => {
  if (!websiteInfo.url) {
    throw new Error("Website info is required");
  }
  try {
    const response = await fetch("http://localhost:5000/guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(websiteInfo),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
