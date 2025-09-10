import React, { useEffect, useState, useMemo } from "react";
import site_stats from "../assets/site_stats.svg";
import {
  Activity,
  Gauge,
  Clock,
  FileText,
  Search,
  Lock,
  CircleCheckBig,
  Clock4,
  TrendingUp,
  TriangleAlert,
  RefreshCw,
  LogOut,
  CircleUser,
} from "lucide-react";
import DialogBox from "./DialogBox";
import WebsiteCard from "./WebsiteCard";
import { getAllWebsitesFromLocalStorage } from "../utils/Constants";
import useAddWebsite from "../utils/useAddWebsite";
import { scrollToSection } from "../utils/Constants";
import { recheckAllWebsites } from "../utils/Constants";
import { useNavigate } from "react-router-dom";
import Button from "../utils/Button";
import { useAuth } from "../context/AuthContext";
import { migrateGuestWebsites } from "../utils/Constants";
import { getAllWebsites, getWebsiteStats } from "../utils/ApiCalls";

const UserHeader = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-2 text-white">
        <CircleUser className="w-5 h-5" />
        <p className="text-sm font-medium capitalize">{user?.name}</p>
      </div>
      <Button
        variant="none"
        className="text-red-200 hover:text-red-500 transition-colors duration-200 font-medium cursor-pointer !px-2 !py-0"
        onClick={() => {
          logout();
        }}
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};

export const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleScrollToSection = (sectionId) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                handleScrollToSection("home");
                navigate("/");
              }}
            >
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                WebMonitor
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Button
              onClick={() => handleScrollToSection("dashboard")}
              variant="none"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => handleScrollToSection("features")}
              variant="none"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Features
            </Button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={() => handleScrollToSection("dashboard")}
              variant="none"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-gray-700/50 cursor-pointer"
            >
              + Add Site
            </Button>

            {user ? (
              <UserHeader />
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                variant="none"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
              >
                Sign In to Get Alerts
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="none"
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
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border-t border-gray-700/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                onClick={() => handleScrollToSection("dashboard")}
                variant="none"
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => handleScrollToSection("features")}
                variant="none"
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
              >
                Features
              </Button>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 pb-3 border-t border-gray-700/50">
                <Button
                  onClick={() => handleScrollToSection("dashboard")}
                  variant="none"
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200 font-medium mb-2 cursor-pointer"
                >
                  + Add Site
                </Button>
                {user ? (
                  <UserHeader />
                ) : (
                  <Button onClick={() => navigate("/auth")}>
                    Sign In to Get Alerts
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const HeaderTextComponent = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");

  const { errorMessage, isLoading, handleAddWebsite, setErrorMessage } =
    useAddWebsite(
      { url: websiteUrl },
      {
        onSuccess: () => {
          window.location.href = "#dashboard";
          window.location.reload();
        },
      }
    );

  return (
    <div
      id="home"
      className="relative min-h-screen bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white overflow-hidden pt-8"
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
                      type="url"
                      placeholder="https://www.google.com"
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        setErrorMessage("");
                      }}
                      className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                    />

                    <Button
                      type="submit"
                      onClick={handleAddWebsite}
                      disabled={isLoading}
                    >
                      {isLoading ? "Checking..." : "Check Now"}
                    </Button>
                  </div>
                </form>
                {isLoading && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black/10 flex items-center justify-center">
                    <div className=" animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
                {errorMessage && (
                  <p className="text-red-400 text-sm font-medium ml-3 mt-1">
                    {errorMessage}
                  </p>
                )}
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
      id: "1",
      icon: <Activity className="w-6 h-6" />,
      title: "Real-Time Status",
      description:
        "Always know if your website is online. Continuous monitoring ensures you stay ahead of downtime.",
    },
    {
      id: "2",
      icon: <Gauge className="w-6 h-6" />,
      title: "Performance Insights",
      description:
        "Measure how fast your site responds. Get instant response time metrics to keep user experience smooth.",
    },
    {
      id: "3",
      icon: <Lock className="w-6 h-6" />,
      title: "SSL Security",
      description:
        "Never let your certificates expire unnoticed. Stay informed about SSL validity, issuer, and days remaining.",
    },
    {
      id: "4",
      icon: <Search className="w-6 h-6" />,
      title: "SEO Health",
      description:
        "Spot hidden SEO issues before they cost you traffic. Detect multiple H1 tags, missing alt text, and more.",
    },
    {
      id: "5",
      icon: <Clock className="w-6 h-6" />,
      title: "Latest Check",
      description:
        "Know exactly when your site was last checked. Stay confident with up-to-date monitoring.",
    },
    {
      id: "6",
      icon: <FileText className="w-6 h-6" />,
      title: "Meta Preview",
      description:
        "See your site the way search engines do. Instantly view title and description for better visibility.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Monitor
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text animate-pulse">
              Your Websites
            </span>
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Comprehensive monitoring tools that give you complete visibility
            into your website's health and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-transparent border border-gray-700/50 hover:border-gray-600/80 p-8 rounded-xl shadow-md hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <div className="text-4xl mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-2 w-12 h-12 flex items-center justify-center">
                {feature.icon}
              </div>
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

export const FooterSection = () => {
  return (
    <footer className="py-12 bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-lg text-white max-w-2xl mx-auto">
            © {new Date().getFullYear()} WebMonitor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const DashboardSection = ({ setShowModal }) => {
  const [websiteList, setWebsiteList] = useState([]);
  const [isRechecking, setIsRechecking] = useState(false);

  const { user } = useAuth();

  const loadWebsites = async () => {
    if (user) {
      const websites = await getAllWebsites(user);
      // setWebsiteList(websites);
      console.log("websites", websites);
      for (const website of websites) {
        const websiteStats = await getWebsiteStats(website);
        const websiteWithId = {
          ...websiteStats,
          id: website._id,
        };

        console.log("websiteWithId", websiteWithId);
        setWebsiteList((prev) => [...prev, websiteWithId]);
      }
    } else {
      const websites = getAllWebsitesFromLocalStorage();
      setWebsiteList((prev) => [...prev, ...websites]);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, [user]);

  // console.log("websiteList", websiteList);

  const activeSites = useMemo(() => {
    return websiteList.filter(
      (website) =>
        website?.data?.status === "online" &&
        website?.data?.responseTime !== "N/A"
    );
  }, [websiteList]);

  const manualMigrateGuestWebsites = () => {
    const filteredWebsites = websiteList.map((website) => {
      return {
        name: website?.data?.name,
        url: website?.data?.url,
        isActive: website?.data?.status === "online",
      };
    });
    const token = user?.tokens?.accessToken?.token;
    migrateGuestWebsites(filteredWebsites, token);
  };

  return (
    <section
      id="dashboard"
      className="py-20 bg-gradient-to-br from-[#0c0e14] via-[#0f1419] to-[#0c0e14] text-white"
    >
      <Button
        onClick={() => manualMigrateGuestWebsites()}
        variant="none"
        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
      >
        Migrate to DB
      </Button>
      <div>
        <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl flex-col gap-5 text-center lg:text-left lg:flex-row lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Monitoring Dashboard
            </h2>
            <p className="text-base text-white max-w-2xl">
              Real-time status of all your monitored websites
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Add Website</Button>
        </div>

        <div className="container mx-auto px-4 max-w-7xl mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            <div className="statsCard bg-transparent border border-gray-700/50 hover:border-gray-600/80 p-8 rounded-xl shadow-md hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/25 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl flex items-center justify-center">
                  <CircleCheckBig className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-base font-medium text-white ">
                  Online Sites
                </h3>
              </div>
              <p className="text-white text-xl font-bold">
                {
                  websiteList.filter(
                    (website) => website?.data?.status === "online"
                  ).length
                }
                /{websiteList.length}
              </p>
            </div>
            <div className="statsCard bg-transparent border border-gray-700/50 hover:border-gray-600/80 p-8 rounded-xl shadow-md hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/25 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl flex items-center justify-center">
                  <Clock4 className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-medium text-white ">
                  Avg Response
                </h3>
              </div>
              <p className="text-white text-xl font-bold">
                {activeSites.length > 0
                  ? Math.round(
                      activeSites.reduce((total, website) => {
                        return (
                          total +
                            parseInt(
                              website?.data?.responseTime.replace("ms", "")
                            ) || 0
                        );
                      }, 0) / activeSites.length
                    )
                  : 0}{" "}
                ms
              </p>
            </div>
            <div className="statsCard bg-transparent border border-gray-700/50 hover:border-gray-600/80 p-8 rounded-xl shadow-md hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/25 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-base font-medium text-white ">
                  SSL Expiry (Soonest)
                </h3>
              </div>
              <p className="text-white text-xl font-bold  ">
                {activeSites.length > 0
                  ? Math.min(
                      ...activeSites.map(
                        (website) => website?.data?.ssl?.daysRemaining
                      )
                    )
                  : 0}
                days
              </p>
            </div>
            <div className="statsCard bg-transparent border border-gray-700/50 hover:border-gray-600/80 p-8 rounded-xl shadow-md hover:shadow-[0px_0px_28px_2px] hover:shadow-cyan-500/25 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl flex items-center justify-center">
                  <TriangleAlert className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-base font-medium text-white ">
                  Total SEO Issues{" "}
                </h3>
              </div>
              <p className="text-white text-xl font-bold">
                {activeSites.reduce(
                  (sum, website) =>
                    sum + (website?.data?.seo?.issues?.length || 0),
                  0
                )}
              </p>
            </div>
          </div>

          {websiteList.length > 0 && (
            <Button
              onClick={() =>
                recheckAllWebsites(setWebsiteList, setIsRechecking)
              }
              disabled={isRechecking}
              variant="none"
              className="flex items-center gap-2 mb-4 text-white cursor-pointer mt-4 ml-auto"
            >
              <RefreshCw
                className={`w-5 h-5 text-cyan-400 ${
                  isRechecking ? "animate-spin" : ""
                }`}
              />
              {isRechecking ? "Rechecking..." : "Recheck"}
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 lg:gap-4">
        {websiteList.map((website) => (
          <WebsiteCard
            key={`${user ? website?.id : website?.data?.url}`}
            websiteInfo={website.data}
          />
        ))}
      </div>
    </section>
  );
};

export const BodyComponent = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <HeaderTextComponent />
      <FeaturesSection />
      <DashboardSection setShowModal={setShowModal} />
      <DialogBox setShowModal={setShowModal} showModal={showModal} />
    </div>
  );
};
