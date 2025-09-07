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

  WebsiteSchema.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json({
        status: true,
        message: messages.WEBSITE_DELETED,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: messages.WEBSITE_DELETION_ERROR,
      });
    });
};

export const getAllWebsite = async (req, res) => {
  const user = req.user;

  const websites = await WebsiteSchema.find({ userId: user._id }).populate({
    path: "userId",
    select: ["name", "email"],
  });

  res.status(200).json({
    status: true,
    message: messages.WEBSITE_FETCHED,
    data: websites,
  });
};

export const guestWebsite = async (req, res) => {
  try {
    const { url, name } = req.body;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "URL is required",
      });
    }

    const isUp = await checkUptime(url);
    // if (!isUp) {
    //   return res.status(422).json({
    //     status: false,
    //     message: messages.WEBSITE_NOT_ACTIVE + " " + url,
    //   });
    // }

    let websiteData;

    if (isUp) {
      const [responseTime, sslInfo, seoInfo] = await Promise.all([
        getResponseTime(url),
        checkSSL(url),
        checkSEO(url),
      ]);

      websiteData = {
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
                algorithm: sslInfo.algorithm,
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
          error: "SSL check failed",
        },
      };
    }

    res.status(200).json({
      status: true,
      message: messages.WEBSITE_FETCHED,
      data: websiteData,
    });
  } catch (error) {
    console.error("Error in guestWebsite:", error);
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
    if (!websites || !Array.isArray(websites)) {
      return res.status(400).json({
        status: false,
        message: "No websites to migrate",
      });
    }
    const results = [];

    for (let i = 0; i < websites.length; i++) {
      const { url, name } = websites[i];

      if (!url) continue;
      const exists = await WebsiteSchema.findOne({ url, userId: user._id });
      if (exists) continue;

      const newWebsite = new WebsiteSchema({
        url,
        websiteName: name || new URL(url).hostname,
        userId: user._id,
        isActive: true,
      });

      await newWebsite.save();
      results.push(newWebsite);

      res.status(201).json({
        status: true,
        message: "Guest websites migrated",
        data: results,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "An error occurred while migrating the websites",
      error: err.message,
    });
  }
};
