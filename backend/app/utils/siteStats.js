import axios from "axios";
import { performance } from "perf_hooks";
import puppeteer from "puppeteer";
import tls from "tls";
import { URL } from "url";



export const isSiteActive = async (url) => {
  if (!url) return false;

  const res = await axios.get(url).catch((err) => void err);
  if (!res || res.status !== 200) return false;
  return true;
};

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

export const checkUptime = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const checkSSL = (siteUrl) => {
  return new Promise((resolve) => {
    try {
      const { hostname, port } = new URL(siteUrl);
      const tlsPort = port || 443;

      const options = {
        host: hostname,
        port: tlsPort,
        servername: hostname, // IMPORTANT for SNI!
        rejectUnauthorized: false, // still allow expired/invalid certs to inspect them
      };

      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate(true);

        if (!cert || Object.keys(cert).length === 0) {
          resolve({ isValid: false, error: "No certificate found" });
          socket.end();
          return;
        }

        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.ceil(
          (validTo - new Date()) / (1000 * 60 * 60 * 24)
        );

        resolve({
          isValid: daysRemaining > 0,
          issuer: cert.issuer?.O || "Unknown",
          subject: cert.subject?.CN || "Unknown",
          validFrom,
          validTo,
          daysRemaining,
          isExpired: daysRemaining <= 0,
        });

        socket.end();
      });

      socket.on("error", (err) => {
        resolve({ isValid: false, error: err.message });
      });
    } catch (err) {
      resolve({ isValid: false, error: err.message });
    }
  });
};

export const checkSEO = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    const seoData = await page.evaluate(() => {
      const title = document.title || "";
      const metaDescription =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";
      const h1 = [...document.querySelectorAll("h1")].map((el) =>
        el.textContent.trim()
      );
      const h2 = [...document.querySelectorAll("h2")].map((el) =>
        el.textContent.trim()
      );
      const images = [...document.querySelectorAll("img")];
      const imagesWithoutAlt = images.filter(
        (img) => !img.getAttribute("alt")?.trim()
      );

      const issues = [];
      if (title.length > 60) issues.push("Title too long (>60 chars)");
      if (metaDescription.length > 160)
        issues.push("Meta description too long (>160 chars)");
      if (h1.length === 0) issues.push("No H1 tag found");
      if (h1.length > 1) issues.push("Multiple H1 tags found");
      if (imagesWithoutAlt.length > 0)
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);

      return {
        title,
        metaDescription,
        h1Count: h1.length,
        h2Count: h2.length,
        imageCount: images.length,
        imagesWithoutAlt: imagesWithoutAlt.length,
        issues,
        hasIssues: issues.length > 0,
      };
    });

    await browser.close();
    return seoData;
  } catch (error) {
    return { error: error.message };
  }
};

