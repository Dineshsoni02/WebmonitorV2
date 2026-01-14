import { getVisitorToken, getVisitorHeaders } from "./useVisitorToken";

const API_BASE_URL = "http://localhost:5000";

/**
 * Get website stats (analyze a website)
 * Works for both guests (with visitor token) and authenticated users
 */
export const getWebsiteStats = async (websiteInfo) => {
  if (!websiteInfo.url) {
    throw new Error("Website info is required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/guest`, {
      method: "POST",
      headers: getVisitorHeaders(),
      body: JSON.stringify(websiteInfo),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get all websites for authenticated user
 */
export const getAllWebsites = async (user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/website`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
      },
    });

    const data = await response.json();
    
    // Check for invalid token response
    if (data?.status === false && data?.message === "Invalid token") {
      const error = new Error("SESSION_INVALID");
      error.isSessionInvalid = true;
      throw error;
    }
    
    return data?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Get all websites for guest user (by visitor token)
 */
export const getGuestWebsites = async () => {
  try {
    const visitorToken = getVisitorToken();
    if (!visitorToken) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/guest/websites`, {
      method: "GET",
      headers: getVisitorHeaders(),
    });

    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Delete a guest website
 */
export const deleteGuestWebsite = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guest/website/${id}`, {
      method: "DELETE",
      headers: getVisitorHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Migrate guest websites to authenticated user
 */
export const migrateGuestWebsites = async (
  guestWebsites,
  token,
  setErrorMessage
) => {
  console.log("migrating websites");
  const websiteMigrateResponse = await fetch(`${API_BASE_URL}/migrate`, {
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

/**
 * Recheck a specific website (manual refresh)
 */
export const recheckWebsite = async (id, user = null) => {
  try {
    const headers = user
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
        }
      : getVisitorHeaders();

    const response = await fetch(`${API_BASE_URL}/website/${id}/recheck`, {
      method: "POST",
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Delete website for authenticated user
 */
export const deleteWebsite = async (id, user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/website/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.tokens?.accessToken?.token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

