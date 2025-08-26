import React from "react";

import { Globe, Lock, TriangleAlert, Search, Trash2 } from "lucide-react";
import { removeWebsiteFromLocalStorage } from "../utils/Constants";

const WebsiteCard = ({ websiteInfo }) => {
  // console.log(websiteInfo);
  const statusColor =
    websiteInfo?.status === "online" ? "bg-green-500" : "bg-red-500";
  const sslStatusColor = websiteInfo?.ssl?.isValid
    ? "bg-green-500"
    : "bg-red-500";
  const seoStatusColor = websiteInfo?.seo?.hasIssues
    ? "bg-yellow-500"
    : "bg-green-500";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="websiteCard relative bg-gray-900/50 border border-gray-700/50 hover:border-cyan-500/50 p-6 rounded-xl shadow-lg hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col gap-4 mb-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className={`!w-3 !h-3 rounded-full ${statusColor} animate-pulse `}
          ></div>
          <div className="flex-1/2">
            <h3 className="text-xl font-bold text-white whitespace-pre-wrap line-clamp-1 mb-1">
              {websiteInfo?.seo?.title || websiteInfo?.name}
            </h3>
            <a
              href={websiteInfo?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 w-max max-w-[300px] overflow-hidden text-ellipsis"
            >
              <Globe className="w-4 h-4" />
              {websiteInfo?.url.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor} text-white`}
        >
          {websiteInfo?.status.charAt(0).toUpperCase() +
            websiteInfo?.status.slice(1)}
        </span>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-3 gap-4 mt-2">
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="text-gray-400 text-xs font-medium mb-1">
            RESPONSE TIME
          </div>
          <div className="text-white font-bold">
            {websiteInfo?.responseTime}
          </div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="text-gray-400 text-xs font-medium mb-1">
            LAST CHECKED
          </div>
          <div className="text-white font-mono text-sm">
            {formatDate(websiteInfo?.lastChecked).split(",")[0]}
          </div>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="text-gray-400 text-xs font-medium mb-1">
            SSL STATUS
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${sslStatusColor}`}></div>
            <span className="text-white text-sm">
              {websiteInfo?.ssl?.daysRemaining}d left
            </span>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Search className="text-cyan-400" />
            <h4 className="text-sm font-medium text-white">SEO Status</h4>
          </div>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${seoStatusColor} text-white`}
          >
            {websiteInfo?.seo?.hasIssues ? "Needs Attention" : "Good"}
          </span>
        </div>

        {websiteInfo?.seo?.metaDescription && (
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {websiteInfo.seo.metaDescription}
          </p>
        )}

        {websiteInfo?.seo?.hasIssues && (
          <div className="mt-2 space-y-1">
            {websiteInfo.seo.issues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-yellow-400 text-xs mt-2"
              >
                <TriangleAlert className=" flex-shrink-0 w-4 h-4" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SSL Details */}
      <div className="mt-2 pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Lock className="text-cyan-400" />
          <span>SSL Certificate</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-500">Issuer</div>
            <div className="text-white truncate">
              {websiteInfo?.ssl?.issuer || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Valid Until</div>
            <div className="text-white">
              {websiteInfo?.ssl?.validTo
                ? new Date(websiteInfo.ssl.validTo).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => removeWebsiteFromLocalStorage(websiteInfo?.url)}
        className="mt-2 absolute bottom-2 right-2 text-red-500 hover:text-red-600 px-2 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer"
      >
        <Trash2 />
      </button>
    </div>
  );
};

export default WebsiteCard;
