import React from "react";

const WebsiteCard = () => {
  return (
    <div className="websiteCard relative bg-transparent border border-gray-700/50 hover:border-gray-600/80 p-8 rounded-xl shadow-md hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/25 transition-all duration-300 flex gap-4 mb-4 flex-col">
      {/* //top */}
      <div className="flex gap-3 ">
        <div className="dot bg-green-400 w-3 h-3 rounded-full animate-pulse"></div>
        <div className="flex flex-col mt-0">
          <div className="text-white font-bold mt-[-5px]">Website Name</div>
          <span className="text-white/80 hover:text-white underline text-sm  ">
            <a href="">http://localhost:5173/</a>
          </span>
        </div>
      </div>

      <div className="absolute top-2 right-2 text-white bg-green-600 px-2.5 py-0.5 text-sm font-medium rounded-full ">
        Online
      </div>

      {/* //bottom */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex gap-0.5 flex-col items-center">
          <div className="text-white font-bold">245ms</div>
          <div className="text-white/60 font-medium text-xs">Response Time</div>
        </div>
        <div className="flex gap-0.5 flex-col items-center">
          <div className="text-white font-bold">99.9%</div>
          <div className="text-white/60 font-medium text-xs">Uptime</div>
        </div>
        <div className="flex gap-0.5 flex-col items-center">
          <div className="text-white font-bold">1</div>
          <div className="text-white/60 font-medium text-xs">SSL Issues</div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteCard;
