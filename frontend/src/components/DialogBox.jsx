import React, { useState } from "react";
import Modal from "../utils/Modal";
import { Globe, X } from "lucide-react";
import useAddWebsite from "../utils/useAddWebsite";

export const DialogBox = ({ showModal, setShowModal }) => {
  const [websiteInfo, setWebsiteInfo] = useState({
    url: "",
    name: "",
  });

  const { errorMessage, isLoading, handleAddWebsite, setErrorMessage } =
    useAddWebsite(websiteInfo, {
      setWebsiteInfo,
      onSuccess: () => {
        setShowModal(false);
        window.location.reload();
      },
    });

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
                {isLoading ? "Adding..." : "Submit"}
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
