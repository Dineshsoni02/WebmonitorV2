export const getWebsiteStats = async (websiteInfo) => {
  console.log("websiteInfo", websiteInfo);
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

export const getAllWebsites = async (user) => {
  try {
    const response = await fetch("http://localhost:5000/website", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
      },
    });

    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const migrateGuestWebsites = async (
  guestWebsites,
  token,
  setErrorMessage
) => {
  console.log("migrating websites");
  console.log("websites", guestWebsites, token);
  const websiteMigrateResponse = await fetch("http://localhost:5000/migrate", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ websites: guestWebsites }),
  }).catch((err) => {
    setErrorMessage(err.message);
  });

  return websiteMigrateResponse;
};
