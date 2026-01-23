"""
SEO metadata analyzer worker.
Analyzes SEO-related metadata for all monitored websites.
Uses BeautifulSoup for lightweight HTML parsing (no browser overhead).
"""

import logging

import requests
from bs4 import BeautifulSoup

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_websites_collection
from config import SEO_ANALYSIS_TIMEOUT

logger = logging.getLogger(__name__)


def analyze_seo(url: str) -> dict:
    """
    Analyze SEO metadata for a URL.

    Args:
        url: The URL to analyze

    Returns:
        Dict with SEO metadata and issues
    """
    try:
        response = requests.get(
            url,
            timeout=SEO_ANALYSIS_TIMEOUT,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; WebMonitor SEO Analyzer/1.0)"
            },
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Extract title
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else ""

        # Extract meta description
        meta_desc_tag = soup.find("meta", attrs={"name": "description"})
        meta_description = meta_desc_tag.get("content", "") if meta_desc_tag else ""

        # Count heading tags
        h1_tags = soup.find_all("h1")
        h2_tags = soup.find_all("h2")

        # Analyze images
        images = soup.find_all("img")
        images_without_alt = [img for img in images if not img.get("alt", "").strip()]

        # Identify SEO issues
        issues = []

        if not title:
            issues.append("No title tag found")
        elif len(title) > 60:
            issues.append("Title too long (>60 chars)")
        elif len(title) < 30:
            issues.append("Title too short (<30 chars)")

        if not meta_description:
            issues.append("No meta description found")
        elif len(meta_description) > 160:
            issues.append("Meta description too long (>160 chars)")
        elif len(meta_description) < 70:
            issues.append("Meta description too short (<70 chars)")

        if len(h1_tags) == 0:
            issues.append("No H1 tag found")
        elif len(h1_tags) > 1:
            issues.append("Multiple H1 tags found")

        if images_without_alt:
            issues.append(f"{len(images_without_alt)} images missing alt text")

        return {
            "title": title,
            "titleLength": len(title),
            "metaDescription": meta_description,
            "metaDescriptionLength": len(meta_description),
            "h1Count": len(h1_tags),
            "h2Count": len(h2_tags),
            "imageCount": len(images),
            "imagesWithoutAlt": len(images_without_alt),
            "issues": issues,
            "hasIssues": len(issues) > 0,
            "error": None,
        }

    except requests.exceptions.Timeout:
        return {"error": "Request timeout"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Request error: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}


def run_seo_analysis():
    """
    Run SEO analysis for all monitored websites.
    Updates MongoDB with SEO metadata.
    """
    logger.info("🔍 Starting SEO analysis...")

    websites = get_websites_collection()

    # Only analyze active/online websites
    all_sites = list(websites.find({"status": "online"}))

    if not all_sites:
        logger.info("No online websites to analyze")
        return

    logger.info(f"Analyzing SEO for {len(all_sites)} websites...")

    checked = 0
    with_issues = 0
    errors = 0

    for site in all_sites:
        url = site.get("url")
        if not url:
            continue

        seo_info = analyze_seo(url)

        # Update the website document with SEO info
        websites.update_one({"_id": site["_id"]}, {"$set": {"seo": seo_info}})

        checked += 1
        if seo_info.get("error"):
            errors += 1
            logger.warning(f"✗ {url}: SEO analysis failed - {seo_info['error']}")
        elif seo_info.get("hasIssues"):
            with_issues += 1
            issue_count = len(seo_info.get("issues", []))
            logger.info(f"⚠ {url}: {issue_count} SEO issues found")
        else:
            logger.debug(f"✓ {url}: No SEO issues")

    logger.info(
        f"✅ SEO analysis completed: {checked} analyzed, {with_issues} with issues, {errors} errors"
    )


if __name__ == "__main__":
    # Allow running directly for testing
    logging.basicConfig(level=logging.INFO)
    run_seo_analysis()
