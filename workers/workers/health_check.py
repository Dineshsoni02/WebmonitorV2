"""
Health check worker for monitoring website uptime and response times.
"""
import logging
from datetime import datetime, timezone
from time import perf_counter

import requests

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_websites_collection, get_users_collection
from config import HEALTH_CHECK_TIMEOUT
from utils.email_sender import send_alert_email

logger = logging.getLogger(__name__)


def check_uptime(url: str) -> tuple[bool, int | None]:
    """
    Check if a website is up and measure response time.
    
    Args:
        url: The URL to check
        
    Returns:
        Tuple of (is_up, response_time_ms)
    """
    try:
        start = perf_counter()
        response = requests.get(
            url,
            timeout=HEALTH_CHECK_TIMEOUT,
            headers={'User-Agent': 'WebMonitor Health Check/1.0'}
        )
        elapsed_ms = int((perf_counter() - start) * 1000)
        return response.status_code == 200, elapsed_ms
    except requests.exceptions.Timeout:
        logger.warning(f"Timeout checking {url}")
        return False, None
    except requests.exceptions.RequestException as e:
        logger.warning(f"Error checking {url}: {e}")
        return False, None


def run_health_checks():
    """
    Run health checks for all monitored websites.
    Updates MongoDB with status and sends email alerts for downtime.
    """
    logger.info("🔄 Starting health checks...")
    
    websites = get_websites_collection()
    users = get_users_collection()
    
    all_sites = list(websites.find({}))
    
    if not all_sites:
        logger.info("No websites to check")
        return
    
    logger.info(f"Checking {len(all_sites)} websites...")
    
    checked = 0
    online = 0
    offline = 0
    
    for site in all_sites:
        url = site.get('url')
        if not url:
            continue
            
        is_up, response_time = check_uptime(url)
        
        update_data = {
            'lastCheckedAt': datetime.now(timezone.utc),
            'status': 'online' if is_up else 'offline',
            'isActive': is_up,
        }
        
        if response_time is not None:
            update_data['responseTime'] = response_time
        
        # Update the website document
        websites.update_one(
            {'_id': site['_id']},
            {'$set': update_data}
        )
        
        checked += 1
        if is_up:
            online += 1
            logger.debug(f"✓ {url}: online ({response_time}ms)")
        else:
            offline += 1
            logger.warning(f"✗ {url}: offline")
            
            # Send email alert if site went down and has a user
            if site.get('isActive') and site.get('userId'):
                user = users.find_one({'_id': site['userId']})
                if user and user.get('email'):
                    send_alert_email(
                        to_email=user['email'],
                        user_name=user.get('name', 'User'),
                        website_url=url
                    )
    
    logger.info(f"✅ Health checks completed: {checked} checked, {online} online, {offline} offline")


if __name__ == '__main__':
    # Allow running directly for testing
    logging.basicConfig(level=logging.INFO)
    run_health_checks()
