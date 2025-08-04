import React from "react";
import websiteStatus from "../assets/websiteStatus.png";

const HeaderTextComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#0c0e14] text-white">
      <div className="flex items-center justify-center p-10   gap-12 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col items-start justify-center flex-1 gap-10">
          <h1 className="text-4xl md:text-6xl font-bold">
            Monitor Your <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 text-transparent bg-clip-text">
              {" "}
              Website Status
            </span>{" "}
            <br />
            24/7
          </h1>
          <p className="text-shadow-white">
            Get instant alerts when your websites go down. Monitor uptime,
            performance, and SEO health from a single dashboard.
          </p>

          <div className="flex flex-col w-full items-start justify-center p-5 border-2 gap-4 border-cyan-500/20 rounded-md">
            <p className="text-white">Try it now - No signup required</p>
            <form
              action=""
              className="flex flex-row items-center justify-center gap-2 w-full"
            >
              <input
                type="text"
                placeholder="https://www.google.com"
                className="border-2 border-cyan-700/30 rounded-md p-2 w-10/12"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-800 to-cyan-700 text-white p-2 rounded-md w-3/12 cursor-pointer"
              >
                Check Now
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 min-h-150">
          <img
            src={websiteStatus}
            alt="website status"
            className="w-full h-full  "
          />
        </div>
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
