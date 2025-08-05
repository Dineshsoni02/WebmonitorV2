import React from "react";
import websiteStatus from "../assets/websiteStatus.png";

const HeaderTextComponent = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white overflow-hidden">
      {/* Background decoration */}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-cyan-900/10"></div>

      <div className="relative z-10 flex items-center justify-center px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-start justify-center flex-1 gap-8 lg:gap-12 max-w-2xl">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                Monitor Your{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text animate-pulse">
                  Website Status
                </span>{" "}
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-300">
                  24/7
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
                Get instant alerts when your websites go down. Monitor uptime,
                performance, and SEO health from a single dashboard with
                enterprise-grade reliability.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Instant alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Performance insights</span>
              </div>
            </div>

            <div className="w-full max-w-lg">
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <p className="text-white font-medium mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Try it now - No signup required
                </p>
                <form className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="https://www.google.com"
                      className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      Check Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 lg:min-h-[600px]">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
                <img
                  src={websiteStatus}
                  alt="Website monitoring dashboard"
                  className="w-full h-auto max-w-lg rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-500"
                />
              </div>
            </div>
          </div>
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
