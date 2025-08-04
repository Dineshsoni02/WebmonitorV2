import React from "react";
import websiteStatus from "../assets/websiteStatus.png";

const HeaderTextComponent = () => {
  return (
    <div className="flex items-center justify-center p-10 bg-blue-50  gap-10 ">
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <h1 className="text-4xl font-bold">
          Monitor Your
          <span className="text-blue-500"> Website Status </span>
          24/7
        </h1>
        <p className="text-gray-500"    >
          Get instant alerts when your websites go down. Monitor uptime,
          performance, and SEO health from a single dashboard.
        </p>

        <div className="flex flex-col w-full items-start justify-center p-2 border-2 gap-2 border-gray-300 rounded-md">
          <p className="text-gray-500">Try it now - No signup required</p>
          <form action="" className="flex flex-row items-center justify-center gap-2">
            <input
              type="text"
              placeholder="https://www.google.com"
              className="border-2 border-gray-300 rounded-md p-2"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
              Check Now
            </button>
          </form>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        <img src={websiteStatus} alt="website status" className="w-full h-full" />
      </div>
    </div>
  );
};

const Body = () => {
  return (
    <div>
      <HeaderTextComponent />
    </div>
  );
};

export default Body;
