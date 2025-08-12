import React, { useState } from "react";
import { Globe, X } from "lucide-react";
import { validateUrl } from "../utils/Validation";

const Modal = (props) => {
  const handleModalClick = () => {
    props.onClose && props.onClose();
  };

  return (
    <div
      className="modal fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={handleModalClick}
    >
      <div
        className="modal_content bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-gray-700/50 text-white rounded-xl my-[15%] h-fit max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
};

export const DialogBox = ({ showModal, setShowModal }) => {
  const [websiteInfo, setWebsiteInfo] = useState({
    url: "",
    name: "",
  });

  const handleAddWebsite = (e) => {
    e.preventDefault();
    if (!validateUrl(websiteInfo.url)) {
      alert("Please enter a valid URL");
      return;
    }
    console.log(websiteInfo);
    setWebsiteInfo({ url: "", name: "" });
    setShowModal(false);
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
                  Enter Website URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  required
                  value={websiteInfo.url}
                  onChange={(e) =>
                    setWebsiteInfo({ ...websiteInfo, url: e.target.value })
                  }
                  className="bg-transparent border border-gray-700 hover:border-gray-600/80 p-2 rounded-lg shadow-md  hover:shadow-cyan-500/10 transition-all duration-300"
                />
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
                // type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
              >
                Submit
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};
export default Modal;
