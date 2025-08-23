import React, { useState, useEffect } from "react";
import { validateUrl } from "../utils/Validation";
import Modal from "../utils/Modal";
import { Globe, X } from "lucide-react";
import { getWebsiteStats } from "../utils/ApiCalls";
import { addWebsiteToLocalStorage, alreadyExists } from "../utils/Constants";

export const DialogBox = ({ showModal, setShowModal }) => {
  const [websiteInfo, setWebsiteInfo] = useState({
    url: "",
    name: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (websiteInfo.url && !websiteInfo.name) {
      try {
        const extractedName = new URL(websiteInfo.url).hostname.replace(
          "www.",
          ""
        );
        setWebsiteInfo({ ...websiteInfo, name: extractedName });
      } catch (err) {
        void err;
      }
    }
  }, [websiteInfo.url]);

  const handleAddWebsite = async (e) => {
    e.preventDefault();

    if (!validateUrl(websiteInfo.url)) {
      setErrorMessage("Please enter a valid URL with https://");
      return;
    }

    if (alreadyExists(websiteInfo.url)) {
      setErrorMessage("Website already exists.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const data = await getWebsiteStats(websiteInfo);
      console.log("data", data);

      if (data?.error || data?.status === false) {
        setErrorMessage(data?.error || data?.message);
        setIsLoading(false);
        return;
      }

      addWebsiteToLocalStorage(data);
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.message);
    }

    setIsLoading(false);
    setWebsiteInfo({ url: "", name: "" });
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className=" p-8 mx-auto relative w-full">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-6 h-6" />

              <h2 className="text-xl font-semibold text-white ">
                Add Website to Monitor
              </h2>
            </div>
            <button
              className=" text-white  rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg  cursor-pointer absolute top-2 right-2"
              onClick={() => setShowModal(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <form className="flex flex-col gap-4" onSubmit={handleAddWebsite}>
              <div className="flex flex-col gap-2">
                <label htmlFor="url" className="text-white">
                  Enter Website URL * (must be with https://)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com *"
                  required
                  value={websiteInfo.url}
                  onChange={(e) => {
                    setWebsiteInfo({ ...websiteInfo, url: e.target.value });
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="bg-transparent border border-gray-700 hover:border-gray-600/80 p-2 rounded-lg shadow-md  hover:shadow-cyan-500/10 transition-all duration-300"
                />
                {errorMessage && (
                  <p className="text-red-400 text-sm font-medium">
                    {errorMessage}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-white">
                  Enter Website Name
                </label>
                <input
                  type="text"
                  placeholder="Example Site"
                  value={websiteInfo.name}
                  onChange={(e) =>
                    setWebsiteInfo({ ...websiteInfo, name: e.target.value })
                  }
                  className="bg-transparent border border-gray-700 hover:border-gray-600/80 p-2 rounded-lg shadow-md hover:shadow-cyan-500/10 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
              >
                {isLoading ? "Loading..." : "Submit"}
              </button>
            </form>

            {isLoading && (
              <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                <div className=" animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
export default DialogBox;
