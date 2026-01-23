"""
MongoDB connection module for Python workers.
Provides database access matching the Node.js schema.
"""
from pymongo import MongoClient
from config import MONGO_URI

# Global client instance
_client = None
_db = None


def get_client():
    """Get or create MongoDB client."""
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client


def get_db():
    """Get the database instance."""
    global _db
    if _db is None:
        client = get_client()
        # Extract database name from URI or use default
        _db = client.get_default_database()
    return _db


def get_websites_collection():
    """Get the websites collection."""
    return get_db().websites


def get_users_collection():
    """Get the users collection."""
    return get_db().users


def get_visitor_tokens_collection():
    """Get the visitor tokens collection."""
    return get_db().visitortokens


def close_connection():
    """Close the MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
