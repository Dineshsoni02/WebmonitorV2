import React from "react";

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

export default Modal;
