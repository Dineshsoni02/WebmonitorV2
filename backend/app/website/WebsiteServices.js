import { messages } from "../constants/responseMessages.js";
import { validateUrl } from "../utils/validation.js";
import WebsiteSchema from "./WebsiteSchema.js";
import axios from "axios";
import {
  getResponseTime,
  checkSSL,
  checkSEO,
  checkUptime,
} from "../utils/siteStats.js";
import { v4 as uuidv4 } from "uuid";

export const createWebsite = async (req, res) => {
  const { url, websiteName } = req.body;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: messages.URL_REQUIRED,
    });
  }

  const isValidUrl = validateUrl(url);

  if (!isValidUrl) {
    return res.status(422).json({
      status: false,
      message: messages.INVALID_URL,
    });
  }

  const user = req.user;

  const response = await axios.get(url).catch((err) => void err);

  if (!response || response.status !== 200) {
    return res.status(422).json({
      status: false,
      message: messages.WEBSITE_NOT_ACTIVE + url,
    });
  }

  const website = await WebsiteSchema.findOne({ url });
  if (website) {
    return res.status(422).json({
      status: false,
      message: messages.WEBSITE_ALREADY_EXISTS,
    });
  }

  if (!websiteName) {
    websiteName = url.split("/")[2];
  }

  const newWebsite = new WebsiteSchema({
    _id: uuidv4(),
    url,
    websiteName,
    userId: user._id,
    isActive: true,
  });

  newWebsite
    .save()
    .then((web) => {
      res.status(201).json({
        status: true,
        message: messages.WEBSITE_CREATED,
        data: web,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: messages.WEBSITE_CREATION_ERROR,
        error: err,
      });
    });
};

export const deleteWebsite = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      status: false,
      message: messages.WEBSITE_ID_REQUIRED,
    });
  }

  const user = req.user;

  WebsiteSchema.deleteOne({ _id: id, userId: user._id })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({
          status: false,
          message: "Website not found or unauthorized",
        });
      }
      res.status(200).json({
        status: true,
        message: messages.WEBSITE_DELETED,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: messages.WEBSITE_DELETION_ERROR,
        error: err.message,
      });
    });
};

export const getAllWebsite = async (req, res) => {
  const user = req.user;

  const websites = await WebsiteSchema.find({ userId: user._id }).lean();

  // Transform to match frontend expected format (same as getGuestWebsites)
  const transformedWebsites = websites.map((site) => {
    // Handle date conversion - lean() returns plain JS Date objects
    let lastChecked = null;
    if (site.lastCheckedAt) {
      lastChecked = site.lastCheckedAt instanceof Date 
        ? site.lastCheckedAt.toISOString() 
        : site.lastCheckedAt;
    } else if (site.updatedAt) {
      lastChecked = site.updatedAt instanceof Date 
        ? site.updatedAt.toISOString() 
        : site.updatedAt;
    }
    
    return {
      id: site._id,
      _id: site._id,
      url: site.url,
      name: site.websiteName,
      websiteName: site.websiteName,
      status: site.status,
      lastChecked,
      responseTime: site.responseTime ? `${site.responseTime}ms` : "N/A",
      ssl: site.ssl,
      seo: site.seo,
    };
  });

  res.status(200).json({
    status: true,
    message: messages.WEBSITE_FETCHED,
    data: transformedWebsites,
  });
};

export const guestWebsite = async (req, res) => {
  try {
    const { url, name, id } = req.body;
    const visitorToken = req.headers["x-visitor-token"];

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "URL is required",
      });
    }

    if (!visitorToken) {
      return res.status(400).json({
        status: false,
        message: "Visitor token is required. Include X-Visitor-Token header.",
      });
    }

    const uniqueId = id || uuidv4();

    const isUp = await checkUptime(url);

    let websiteData;

    if (isUp) {
      const [responseTime, sslInfo, seoInfo] = await Promise.all([
        getResponseTime(url),
        checkSSL(url),
        checkSEO(url),
      ]);

      websiteData = {
        id: uniqueId,
        url,
        name: name || new URL(url).hostname,
        status: "online",
        lastChecked: new Date().toISOString(),
        responseTime: responseTime ? `${responseTime}ms` : "N/A",
        ssl: {
          isValid: sslInfo?.isValid || false,
          ...(sslInfo?.isValid
            ? {
                issuer: sslInfo.issuer,
                validFrom: sslInfo.validFrom,
                validTo: sslInfo.validTo,
                daysRemaining: sslInfo.daysRemaining,
              }
            : { error: sslInfo?.error || "SSL check failed" }),
        },
        seo: seoInfo.error
          ? { error: seoInfo.error }
          : {
              title: seoInfo.title,
              titleLength: seoInfo.titleLength,
              metaDescription: seoInfo.metaDescription,
              metaDescriptionLength: seoInfo.metaDescriptionLength,
              h1Count: seoInfo.h1Count,
              h2Count: seoInfo.h2Count,
              imageCount: seoInfo.imageCount,
              imagesWithoutAlt: seoInfo.imagesWithoutAlt,
              issues: seoInfo.issues,
              hasIssues: seoInfo.hasIssues,
            },
      };
    } else {
      websiteData = {
        id: uniqueId,
        url,
        name: name || new URL(url).hostname,
        status: "offline",
        lastChecked: new Date().toISOString(),
        responseTime: "0ms",
        ssl: {
          isValid: false,
          error: "SSL check failed",
        },
        seo: {
          error: "SEO check failed - site offline",
        },
      };
    }

    // Persist to database with visitor token
    try {
      const existingWebsite = await WebsiteSchema.findOne({
        url,
        visitorToken,
        userId: null,
      });

      if (existingWebsite) {
        // Update existing website
        await WebsiteSchema.findByIdAndUpdate(existingWebsite._id, {
          websiteName: websiteData.name,
          status: websiteData.status,
          responseTime: parseInt(websiteData.responseTime) || 0,
          lastCheckedAt: new Date(),
          isActive: isUp,
          ssl: {
            isValid: websiteData.ssl.isValid,
            issuer: websiteData.ssl.issuer || null,
            validFrom: websiteData.ssl.validFrom || null,
            validTo: websiteData.ssl.validTo || null,
            daysRemaining: websiteData.ssl.daysRemaining || null,
            error: websiteData.ssl.error || null,
          },
          seo: websiteData.seo.error
            ? { error: websiteData.seo.error }
            : {
                title: websiteData.seo.title,
                titleLength: websiteData.seo.titleLength,
                metaDescription: websiteData.seo.metaDescription,
                metaDescriptionLength: websiteData.seo.metaDescriptionLength,
                h1Count: websiteData.seo.h1Count,
                h2Count: websiteData.seo.h2Count,
                imageCount: websiteData.seo.imageCount,
                imagesWithoutAlt: websiteData.seo.imagesWithoutAlt,
                issues: websiteData.seo.issues || [],
                hasIssues: websiteData.seo.hasIssues || false,
              },
        });
        // Return the existing ID
        websiteData.id = existingWebsite._id;
      } else {
        // Create new website
        const newWebsite = new WebsiteSchema({
          _id: uniqueId,
          url,
          websiteName: websiteData.name,
          visitorToken,
          userId: null,
          ownerStatus: "guest",
          status: websiteData.status,
          responseTime: parseInt(websiteData.responseTime) || 0,
          lastCheckedAt: new Date(),
          isActive: isUp,
          ssl: {
            isValid: websiteData.ssl.isValid,
            issuer: websiteData.ssl.issuer || null,
            validFrom: websiteData.ssl.validFrom || null,
            validTo: websiteData.ssl.validTo || null,
            daysRemaining: websiteData.ssl.daysRemaining || null,
            error: websiteData.ssl.error || null,
          },
          seo: websiteData.seo.error
            ? { error: websiteData.seo.error }
            : {
                title: websiteData.seo.title,
                titleLength: websiteData.seo.titleLength,
                metaDescription: websiteData.seo.metaDescription,
                metaDescriptionLength: websiteData.seo.metaDescriptionLength,
                h1Count: websiteData.seo.h1Count,
                h2Count: websiteData.seo.h2Count,
                imageCount: websiteData.seo.imageCount,
                imagesWithoutAlt: websiteData.seo.imagesWithoutAlt,
                issues: websiteData.seo.issues || [],
                hasIssues: websiteData.seo.hasIssues || false,
              },
        });
        await newWebsite.save();
      }
    } catch (dbError) {
      // Still return success - we have the data even if DB save failed
    }

    res.status(200).json({
      status: true,
      message: messages.WEBSITE_FETCHED,
      data: websiteData,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred while analyzing the website",
      error: error.message,
    });
  }
};

export const migrateGuestWebsites = async (req, res) => {
  try {
    const { websites } = req.body;
    const user = req.user;
    
    console.log("=== MIGRATE DEBUG ===");
    console.log("User:", user?._id);
    console.log("Websites to migrate:", JSON.stringify(websites));
    
    if (!websites || !Array.isArray(websites)) {
      return res.status(400).json({
        status: false,
        message: "No websites to migrate",
      });
    }
    const results = [];

    for (let i = 0; i < websites.length; i++) {
      const { id, url, name } = websites[i];
      console.log(`Processing website ${i}: id=${id}, url=${url}`);
      if (!url || !id) {
        console.log("Skipping - missing url or id");
        continue;
      }
      
      // Check if this URL already exists for this user
      const existsByUserUrl = await WebsiteSchema.findOne({ url: url, userId: user._id });
      
      if (existsByUserUrl) {
        console.log("Already exists for this user:", existsByUserUrl._id);
        // If it exists, we return the existing one so frontend can update its ID
        results.push(existsByUserUrl);
        continue;
      }

      // Check if website exists by _id (created via /guest endpoint)
      const existsById = await WebsiteSchema.findById(id);
      console.log("Found by ID:", existsById ? "YES" : "NO");
      
      if (existsById) {
        console.log("Updating website to assign userId:", user._id);
        // Update the existing website to assign it to this user
        const updatedWebsite = await WebsiteSchema.findByIdAndUpdate(
          id,
          { 
            userId: user._id, 
            ownerStatus: "active",
            websiteName: name || existsById.websiteName,
          },
          { new: true }
        );
        console.log("Updated website:", updatedWebsite?._id, "userId:", updatedWebsite?.userId);
        results.push(updatedWebsite);
        continue;
      }

      console.log("Creating new website with userId:", user._id);
      const newWebsite = new WebsiteSchema({
        _id: id, 
        url,
        websiteName: name || new URL(url).hostname,
        userId: user._id,
        ownerStatus: "active",
        isActive: true,
      });

      try {
        await newWebsite.save();
        results.push(newWebsite);
      } catch (err) {
        if (err.code === 11000) {
            const retryExists = await WebsiteSchema.findOne({ url: url, userId: user._id });
            if (retryExists) results.push(retryExists);
        }
      }
    }

    res.status(201).json({
      status: true,
      message: "Guest websites migrated",
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "An error occurred while migrating the websites",
      error: err.message,
    });
  }
};

/**
 * Get all websites for a guest user by visitor token
 * Enables "continue where you left off" UX
 */
export const getGuestWebsites = async (req, res) => {
  try {
    const visitorToken = req.headers["x-visitor-token"];

    if (!visitorToken) {
      return res.status(400).json({
        status: false,
        message: "Visitor token is required. Include X-Visitor-Token header.",
      });
    }

    const websites = await WebsiteSchema.find({
      visitorToken,
      userId: null,
      ownerStatus: "guest",
    }).lean();

    // Transform to match frontend expected format
    const transformedWebsites = websites.map((site) => {
      // Handle date conversion - lean() returns plain JS Date objects
      let lastChecked = null;
      if (site.lastCheckedAt) {
        lastChecked = site.lastCheckedAt instanceof Date 
          ? site.lastCheckedAt.toISOString() 
          : site.lastCheckedAt;
      } else if (site.updatedAt) {
        lastChecked = site.updatedAt instanceof Date 
          ? site.updatedAt.toISOString() 
          : site.updatedAt;
      }
      
      return {
        id: site._id,
        url: site.url,
        name: site.websiteName,
        status: site.status,
        lastChecked,
        responseTime: site.responseTime ? `${site.responseTime}ms` : "N/A",
        ssl: site.ssl,
        seo: site.seo,
      };
    });

    res.status(200).json({
      status: true,
      message: "Guest websites fetched",
      data: transformedWebsites,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch guest websites",
      error: error.message,
    });
  }
};

/**
 * Delete a guest website by ID and visitor token
 */
export const deleteGuestWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const visitorToken = req.headers["x-visitor-token"];

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Website ID is required",
      });
    }

    if (!visitorToken) {
      return res.status(400).json({
        status: false,
        message: "Visitor token is required. Include X-Visitor-Token header.",
      });
    }

    const result = await WebsiteSchema.deleteOne({
      _id: id,
      visitorToken,
      userId: null,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: false,
        message: "Website not found or unauthorized",
      });
    }

    res.status(200).json({
      status: true,
      message: "Website deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to delete website",
      error: error.message,
    });
  }
};

/**
 * Recheck a specific website (manual refresh)
 */
export const recheckWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const visitorToken = req.headers["x-visitor-token"];
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Website ID is required",
      });
    }

    // Find website - check both guest and user ownership
    let website;
    if (user) {
      website = await WebsiteSchema.findOne({ _id: id, userId: user._id });
    } else if (visitorToken) {
      website = await WebsiteSchema.findOne({ _id: id, visitorToken, userId: null });
    }

    if (!website) {
      return res.status(404).json({
        status: false,
        message: "Website not found or unauthorized",
      });
    }

    // Perform fresh checks
    const url = website.url;
    const isUp = await checkUptime(url);

    let updatedData;
    if (isUp) {
      const [responseTime, sslInfo, seoInfo] = await Promise.all([
        getResponseTime(url),
        checkSSL(url),
        checkSEO(url),
      ]);

      updatedData = {
        status: "online",
        isActive: true,
        responseTime: responseTime || 0,
        lastCheckedAt: new Date(),
        ssl: {
          isValid: sslInfo?.isValid || false,
          issuer: sslInfo?.issuer || null,
          validFrom: sslInfo?.validFrom || null,
          validTo: sslInfo?.validTo || null,
          daysRemaining: sslInfo?.daysRemaining || null,
          error: sslInfo?.error || null,
        },
        seo: seoInfo?.error
          ? { error: seoInfo.error }
          : {
              title: seoInfo?.title,
              titleLength: seoInfo?.titleLength,
              metaDescription: seoInfo?.metaDescription,
              metaDescriptionLength: seoInfo?.metaDescriptionLength,
              h1Count: seoInfo?.h1Count,
              h2Count: seoInfo?.h2Count,
              imageCount: seoInfo?.imageCount,
              imagesWithoutAlt: seoInfo?.imagesWithoutAlt,
              issues: seoInfo?.issues || [],
              hasIssues: seoInfo?.hasIssues || false,
            },
      };
    } else {
      updatedData = {
        status: "offline",
        isActive: false,
        responseTime: 0,
        lastCheckedAt: new Date(),
      };
    }

    await WebsiteSchema.findByIdAndUpdate(id, updatedData);

    // Fetch updated website
    const updatedWebsite = await WebsiteSchema.findById(id).lean();

    res.status(200).json({
      status: true,
      message: "Website rechecked successfully",
      data: {
        id: updatedWebsite._id,
        url: updatedWebsite.url,
        name: updatedWebsite.websiteName,
        status: updatedWebsite.status,
        lastChecked: updatedWebsite.lastCheckedAt?.toISOString(),
        responseTime: updatedWebsite.responseTime ? `${updatedWebsite.responseTime}ms` : "N/A",
        ssl: updatedWebsite.ssl,
        seo: updatedWebsite.seo,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to recheck website",
      error: error.message,
    });
  }
};
