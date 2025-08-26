import React, { useState, useEffect } from "react";
import { validateUrl } from "./Validation";
import { getWebsiteStats } from "./ApiCalls";
import { addWebsiteToLocalStorage, alreadyExists } from "./Constants";

const useAddWebsite = (websiteInfo, options = {}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // console.log(websiteInfo);
  useEffect(() => {
    if (websiteInfo.url && !websiteInfo.name) {
      try {
        const extractedName = new URL(websiteInfo.url).hostname.replace(
          "www.",
          ""
        );
        options?.setWebsiteInfo?.((prev) => ({ ...prev, name: extractedName }));
      } catch (err) {
        void err;
      }
    }
  }, [websiteInfo.url]);

  const addWebsite = async (websiteData) => {
    if (!validateUrl(websiteData.url)) {
      return { error: "Please enter a valid URL with https://" };
    }

    if (alreadyExists(websiteData.url)) {
      return { error: "Website already exists." };
    }

    try {
      const data = await getWebsiteStats(websiteData);

      if (data?.error || data?.status === false) {
        return { error: data?.error || data?.message };
      }

      addWebsiteToLocalStorage(data);
      return { success: true, data };
    } catch (error) {
      return { error: error?.message || "Something went wrong" };
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = await addWebsite(websiteInfo);

    if (result.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    if (options.onSuccess) {
      options.onSuccess(result.data);
    }

    if (options.setWebsiteInfo) {
      options.setWebsiteInfo({ url: "", name: "" });
    }
    return result;
  };

  return { errorMessage, isLoading, handleAddWebsite, setErrorMessage };
};

export default useAddWebsite;
