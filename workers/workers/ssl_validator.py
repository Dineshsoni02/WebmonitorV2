"""
SSL certificate validator worker.
Checks SSL certificate validity and expiration for all monitored websites.
"""
import logging
import socket
import ssl
from datetime import datetime, timezone
from urllib.parse import urlparse

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_websites_collection
from config import SSL_CHECK_TIMEOUT

logger = logging.getLogger(__name__)


def check_ssl(url: str) -> dict:
    """
    Validate SSL certificate for a URL.
    
    Args:
        url: The URL to check SSL for
        
    Returns:
        Dict with SSL certificate information
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        port = parsed.port or 443
        
        if not hostname:
            return {'isValid': False, 'error': 'Invalid URL'}
        
        # Skip non-HTTPS URLs
        if parsed.scheme != 'https':
            return {'isValid': False, 'error': 'Not an HTTPS URL'}
        
        context = ssl.create_default_context()
        
        with socket.create_connection((hostname, port), timeout=SSL_CHECK_TIMEOUT) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
        
        if not cert:
            return {'isValid': False, 'error': 'No certificate found'}
        
        # Parse certificate dates
        # Format: 'Mar 15 00:00:00 2024 GMT'
        date_format = '%b %d %H:%M:%S %Y %Z'
        valid_from = datetime.strptime(cert['notBefore'], date_format)
        valid_to = datetime.strptime(cert['notAfter'], date_format)
        
        # Calculate days remaining
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        days_remaining = (valid_to - now).days
        
        # Extract issuer organization
        issuer_info = dict(x[0] for x in cert.get('issuer', ()))
        issuer = issuer_info.get('organizationName', 'Unknown')
        
        # Extract subject
        subject_info = dict(x[0] for x in cert.get('subject', ()))
        subject = subject_info.get('commonName', 'Unknown')
        
        return {
            'isValid': days_remaining > 0,
            'issuer': issuer,
            'subject': subject,
            'validFrom': valid_from,
            'validTo': valid_to,
            'daysRemaining': days_remaining,
            'isExpired': days_remaining <= 0,
            'error': None
        }
        
    except socket.timeout:
        return {'isValid': False, 'error': 'Connection timeout'}
    except ssl.SSLError as e:
        return {'isValid': False, 'error': f'SSL error: {str(e)}'}
    except socket.error as e:
        return {'isValid': False, 'error': f'Connection error: {str(e)}'}
    except Exception as e:
        return {'isValid': False, 'error': str(e)}


def run_ssl_checks():
    """
    Run SSL certificate checks for all monitored websites.
    Updates MongoDB with SSL information.
    """
    logger.info("🔒 Starting SSL certificate checks...")
    
    websites = get_websites_collection()
    
    # Only check HTTPS websites
    all_sites = list(websites.find({'url': {'$regex': '^https://'}}))
    
    if not all_sites:
        logger.info("No HTTPS websites to check")
        return
    
    logger.info(f"Checking SSL for {len(all_sites)} websites...")
    
    checked = 0
    valid = 0
    invalid = 0
    expiring_soon = 0
    
    for site in all_sites:
        url = site.get('url')
        if not url:
            continue
            
        ssl_info = check_ssl(url)
        
        # Update the website document with SSL info
        websites.update_one(
            {'_id': site['_id']},
            {'$set': {'ssl': ssl_info}}
        )
        
        checked += 1
        if ssl_info.get('isValid'):
            valid += 1
            days = ssl_info.get('daysRemaining', 0)
            if days <= 30:
                expiring_soon += 1
                logger.warning(f"⚠ {url}: SSL expires in {days} days")
            else:
                logger.debug(f"✓ {url}: SSL valid ({days} days remaining)")
        else:
            invalid += 1
            logger.warning(f"✗ {url}: SSL invalid - {ssl_info.get('error', 'Unknown error')}")
    
    logger.info(f"✅ SSL checks completed: {checked} checked, {valid} valid, {invalid} invalid, {expiring_soon} expiring soon")


if __name__ == '__main__':
    # Allow running directly for testing
    logging.basicConfig(level=logging.INFO)
    run_ssl_checks()
