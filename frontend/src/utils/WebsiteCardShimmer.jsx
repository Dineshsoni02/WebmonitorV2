import React from "react";

const WebsiteCardShimmer = (i) => {
  return (
    <div
      key={i}
      className="relative bg-gray-900/50 border border-gray-700/50 rounded-xl shadow-lg p-6 h-[350px] flex flex-col gap-4 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-shimmer"></div>

      <div className="flex justify-between items-center">
        <div className="h-5 w-3/4 bg-gray-700/70 rounded animate-pulse"></div>
        <div className="h-5 w-16 bg-gray-700/60 rounded-full animate-pulse"></div>
      </div>

      <div className="h-4 w-2/3 bg-gray-700/50 rounded animate-pulse"></div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {Array(3)
          .fill(null)
          .map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center bg-gray-800/40 rounded-lg p-3 h-[70px] animate-pulse"
            >
              <div className="h-4 w-1/2 bg-gray-700/70 rounded"></div>
              <div className="h-4 w-2/3 mt-2 bg-gray-700/50 rounded"></div>
            </div>
          ))}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="h-5 w-5 bg-gray-700/60 rounded-full animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-700/50 rounded animate-pulse"></div>
      </div>

      <div className="h-4 w-full bg-gray-700/40 rounded animate-pulse"></div>
      <div className="h-4 w-5/6 bg-gray-700/40 rounded animate-pulse"></div>

      <div className="flex justify-between items-end mt-auto pt-3">
        <div>
          <div className="h-4 w-32 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-3 w-24 mt-1 bg-gray-700/40 rounded animate-pulse"></div>
        </div>
        <div className="h-5 w-5 bg-gray-700/60 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default WebsiteCardShimmer;
