"""
Cleanup worker for expired visitor tokens and old data.
Mirrors the cleanup logic from Node.js backend.
"""
import logging
from datetime import datetime, timezone, timedelta

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_visitor_tokens_collection, get_websites_collection

logger = logging.getLogger(__name__)


def cleanup_expired_tokens():
    """
    Mark visitor tokens as expired if they have passed their expiration date.
    """
    tokens = get_visitor_tokens_collection()
    now = datetime.now(timezone.utc)
    
    result = tokens.update_many(
        {
            'expiresAt': {'$lt': now},
            'isExpired': False
        },
        {'$set': {'isExpired': True}}
    )
    
    if result.modified_count > 0:
        logger.info(f"Marked {result.modified_count} tokens as expired")
    
    return result.modified_count


def purge_old_expired_tokens():
    """
    Delete visitor tokens and their associated websites if expired for more than 7 days.
    """
    tokens = get_visitor_tokens_collection()
    websites = get_websites_collection()
    
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    # Find tokens expired more than 7 days ago
    old_tokens = list(tokens.find({
        'isExpired': True,
        'expiresAt': {'$lt': seven_days_ago}
    }))
    
    if not old_tokens:
        logger.debug("No old expired tokens to purge")
        return 0
    
    deleted_websites = 0
    deleted_tokens = 0
    
    for token in old_tokens:
        token_id = token.get('tokenId')
        
        if token_id:
            # Delete associated guest websites
            result = websites.delete_many({'visitorToken': token_id})
            deleted_websites += result.deleted_count
        
        # Delete the token
        tokens.delete_one({'_id': token['_id']})
        deleted_tokens += 1
    
    if deleted_tokens > 0 or deleted_websites > 0:
        logger.info(f"Purged {deleted_tokens} old tokens and {deleted_websites} associated websites")
    
    return deleted_tokens


def run_cleanup():
    """
    Run all cleanup tasks.
    """
    logger.info("🧹 Starting cleanup...")
    
    try:
        expired_count = cleanup_expired_tokens()
        purged_count = purge_old_expired_tokens()
        
        logger.info(f"✅ Cleanup completed: {expired_count} marked expired, {purged_count} purged")
        
    except Exception as e:
        logger.error(f"❌ Cleanup failed: {e}")
        raise


if __name__ == '__main__':
    # Allow running directly for testing
    logging.basicConfig(level=logging.INFO)
    run_cleanup()
