import axios from "axios";
import https from "https";
import { performance } from "perf_hooks";
import { JSDOM } from "jsdom";
import dns from "dns";
import util from "util";

const dnsLookup = util.promisify(dns.lookup);


export const isSiteActive = async (url) => {
  if (!url) return false;

  const res = await axios.get(url).catch((err) => void err);
  if (!res || !res.status == 200) return false;
  return true;
};

// Get website response time in milliseconds
export const getResponseTime = async (url) => {
  try {
    const start = performance.now();
    await axios.get(url);
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    console.error("Error measuring response time:", error);
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

    await axios.get(`https://${hostname}`, {
      httpsAgent: agent,
      timeout: 10000,
    });

    // Get certificate info
    const cert = await new Promise((resolve) => {
      const req = https.request(
        { host: hostname, port: 443, method: "HEAD", agent },
        () => {}
      );
      req.on("socket", (socket) => {
        socket.on("secureConnect", () => {
          const cert = socket.getPeerCertificate();
          resolve(cert);
        });
      });
      req.on("error", () => resolve(null));
      req.end();
    });
    n;

    if (!cert || Object.keys(cert).length === 0) {
      return { isValid: false, error: "No SSL certificate found" };
    }

    const validTo = new Date(cert.valid_to);
    const daysRemaining = Math.ceil(
      (validTo - new Date()) / (1000 * 60 * 60 * 24)
    );

    return {
      isValid: true,
      issuer: cert.issuer.O,
      validFrom: new Date(cert.valid_from),
      validTo,
      daysRemaining,
      isExpired: daysRemaining <= 0,
      algorithm: cert.serialNumber ? "TLS 1.2+" : "Unknown",
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
    const title = doc.querySelector("title")?.textContent || "";
    const metaDescription =
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
      "";
    const h1 = Array.from(doc.querySelectorAll("h1")).map((h) => h.textContent);
    const h2 = Array.from(doc.querySelectorAll("h2")).map((h) => h.textContent);
    const images = Array.from(doc.querySelectorAll("img"));

    // Check for common SEO issues
    const issues = [];
    if (title.length > 60) issues.push("Title is too long (max 60 chars)");
    if (metaDescription.length > 160)
      issues.push("Meta description is too long (max 160 chars)");
    if (h1.length === 0) issues.push("No H1 tag found");
    if (h1.length > 1) issues.push("Multiple H1 tags found");

    // Check images for alt text
    const imagesWithoutAlt = images.filter((img) => !img.alt.trim());
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
      hasIssues: issues.length > 0,
    };
  } catch (error) {
    console.error("SEO check error:", error);
    return { error: error.message };
  }
};
