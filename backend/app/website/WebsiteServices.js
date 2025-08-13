import { messages } from "../constants/responseMessages.js";
import { validateUrl } from "../utils/validation.js";
import WebsiteSchema from "./WebsiteSchema.js";
import axios from "axios";
import https from 'https';
import { performance } from 'perf_hooks';
import { JSDOM } from 'jsdom';
import dns from 'dns';
import util from 'util';

const dnsLookup = util.promisify(dns.lookup);

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

// Get website response time in milliseconds
export const getResponseTime = async (url) => {
  try {
    const start = performance.now();
    await axios.get(url);
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    console.error('Error measuring response time:', error);
    return null;
  }
};

// Check if website is up
export const checkUptime = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Check SSL certificate validity
export const checkSSL = async (url) => {
  try {
    const hostname = new URL(url).hostname;
    const agent = new https.Agent({ rejectUnauthorized: false });
    
    await axios.get(`https://${hostname}`, { httpsAgent: agent, timeout: 10000 });
    
    // Get certificate info
    const cert = await new Promise((resolve) => {
      const req = https.request({ host: hostname, port: 443, method: 'HEAD', agent }, () => {});
      req.on('socket', (socket) => {
        socket.on('secureConnect', () => {
          const cert = socket.getPeerCertificate();
          resolve(cert);
        });
      });
      req.on('error', () => resolve(null));
      req.end();
    });n
    
    if (!cert || Object.keys(cert).length === 0) {
      return { isValid: false, error: 'No SSL certificate found' };
    }
    
    const validTo = new Date(cert.valid_to);
    const daysRemaining = Math.ceil((validTo - new Date()) / (1000 * 60 * 60 * 24));
    
    return {
      isValid: true,
      issuer: cert.issuer.O,
      validFrom: new Date(cert.valid_from),
      validTo,
      daysRemaining,
      isExpired: daysRemaining <= 0,
      algorithm: cert.serialNumber ? 'TLS 1.2+' : 'Unknown'
    };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Basic SEO analysis
export const checkSEO = async (url) => {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const doc = dom.window.document;
    
    // Get title and meta description
    const title = doc.querySelector('title')?.textContent || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const h1 = Array.from(doc.querySelectorAll('h1')).map(h => h.textContent);
    const h2 = Array.from(doc.querySelectorAll('h2')).map(h => h.textContent);
    const images = Array.from(doc.querySelectorAll('img'));
    
    // Check for common SEO issues
    const issues = [];
    if (title.length > 60) issues.push('Title is too long (max 60 chars)');
    if (metaDescription.length > 160) issues.push('Meta description is too long (max 160 chars)');
    if (h1.length === 0) issues.push('No H1 tag found');
    if (h1.length > 1) issues.push('Multiple H1 tags found');
    
    // Check images for alt text
    const imagesWithoutAlt = images.filter(img => !img.alt.trim());
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} image(s) without alt text`);
    }
    
    return {
      title,
      titleLength: title.length,
      metaDescription,
      metaDescriptionLength: metaDescription.length,
      h1Count: h1.length,
      h2Count: h2.length,
      imageCount: images.length,
      imagesWithoutAlt: imagesWithoutAlt.length,
      issues,
      hasIssues: issues.length > 0
    };
  } catch (error) {
    console.error('SEO check error:', error);
    return { error: error.message };
  }
};

export const guestWebsite = async (req, res) => {
  try {
    const { url, name } = req.body;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'URL is required',
      });
    }

    // Add http:// if no protocol is specified
    const formattedUrl = url.startsWith('http') ? url : `http://${url}`;
    
    // Check if website is up first
    const isUp = await checkUptime(formattedUrl);
    if (!isUp) {
      return res.status(422).json({
        status: false,
        message: messages.WEBSITE_NOT_ACTIVE + url,
      });
    }

    // Run all checks in parallel
    const [responseTime, sslInfo, seoInfo] = await Promise.all([
      getResponseTime(formattedUrl),
      checkSSL(formattedUrl),
      checkSEO(formattedUrl)
    ]);

    // Prepare response data
    const websiteData = {
      url: formattedUrl,
      name: name || new URL(formattedUrl).hostname,
      status: 'online',
      lastChecked: new Date().toISOString(),
      responseTime: responseTime ? `${responseTime}ms` : 'N/A',
      ssl: {
        isValid: sslInfo?.isValid || false,
        ...(sslInfo?.isValid ? {
          issuer: sslInfo.issuer,
          validFrom: sslInfo.validFrom,
          validTo: sslInfo.validTo,
          daysRemaining: sslInfo.daysRemaining,
          algorithm: sslInfo.algorithm
        } : { error: sslInfo?.error || 'SSL check failed' })
      },
      seo: seoInfo.error ? { error: seoInfo.error } : {
        title: seoInfo.title,
        titleLength: seoInfo.titleLength,
        metaDescription: seoInfo.metaDescription,
        metaDescriptionLength: seoInfo.metaDescriptionLength,
        h1Count: seoInfo.h1Count,
        h2Count: seoInfo.h2Count,
        imageCount: seoInfo.imageCount,
        imagesWithoutAlt: seoInfo.imagesWithoutAlt,
        issues: seoInfo.issues,
        hasIssues: seoInfo.hasIssues
      }
    };

    res.status(200).json({
      status: true,
      message: messages.WEBSITE_FETCHED,
      data: websiteData,
    });
  } catch (error) {
    console.error('Error in guestWebsite:', error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while analyzing the website',
      error: error.message
    });
  }
};
