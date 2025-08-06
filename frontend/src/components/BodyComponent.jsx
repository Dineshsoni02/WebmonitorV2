import React, { useState } from "react";
import site_stats from "../assets/site_stats.svg";


const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleAuthNavigation = (page) => {
    console.log(`Navigating to ${page} page`);
    // You can replace this with your routing logic
    // window.location.href = `/auth?page=${page}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                WebMonitor
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("dashboard")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Features
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollToSection("dashboard")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-gray-700/50 cursor-pointer"
            >
              + Add Site
            </button>
            <button
              onClick={() => handleAuthNavigation("signup")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-200 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border-t border-gray-700/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => scrollToSection("home")}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("dashboard")}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
              >
                Features
              </button>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 pb-3 border-t border-gray-700/50">
                <button
                  onClick={() => scrollToSection("dashboard")}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium mb-2 cursor-pointer"
                >
                  + Add Site
                </button>
                <button
                  onClick={() => handleAuthNavigation("signup")}
                  className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const HeaderTextComponent = () => {
  return (
    <div
      id="home"
      className="relative min-h-screen bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-cyan-900/10"></div>

      <div className="relative z-10 flex items-center justify-center px-4 py-16 lg:py-22">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-start justify-center flex-1 gap-8  max-w-2xl">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Monitor Your <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text animate-pulse">
                  Website Status
                </span>
                <br />
                24/7
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
          <div className="flex flex-col items-center justify-center flex-1 lg:min-h-[500px]">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
                <img
                  src={site_stats}
                  alt="Website monitoring dashboard"
                  className="w-full h-auto lg:h-[500px] max-w-lg rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      id:"1",
      icon: <BarChartIcon className="w-6 h-6" />,
      title: "Real-time Analytics",
      description:
        "Get instant insights with our powerful real-time monitoring and analytics dashboard.",
    },
    {
      id:"2", 
      icon: <BellIcon className="w-6 h-6" />,
      title: "Instant Alerts",
      description:
        "Receive immediate notifications when your website experiences any downtime or issues.",
    },
    {
      id:"3",
      icon: <PhoneIcon className="w-6 h-6" />,
      title: "Mobile Responsive",
      description:
        "Monitor your websites on the go with our fully responsive mobile interface.",
    },
    {
      id:"4",
      icon: <FlashIcon className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Our optimized system ensures minimal impact on your website performance.",
    },
    {
      id:"5", 
      icon:   <LockIcon className="w-6 h-6" />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and stored securely with enterprise-grade security measures.",
    },
    {
      id:"6",
      icon: <ChartLineIcon className="w-6 h-6" />,
      title: "Performance Reports",
      description:
        "Detailed reports and analytics to help you optimize your website performance.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Everything you need to monitor and optimize your website's
            performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BodyComponent = () => {
  return (
    <div>
      <NavigationBar />
      <HeaderTextComponent />
      <FeaturesSection />
    </div>
  );
};
