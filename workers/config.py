"""
Configuration module for Python workers.
Loads environment variables from .env file.
"""
import os
from dotenv import load_dotenv

# Load environment from parent directory (backend/.env)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is required")

# Email Configuration
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASS = os.getenv('EMAIL_PASS')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))

# Worker Configuration
HEALTH_CHECK_TIMEOUT = int(os.getenv('HEALTH_CHECK_TIMEOUT', 10))
SEO_ANALYSIS_TIMEOUT = int(os.getenv('SEO_ANALYSIS_TIMEOUT', 15))
SSL_CHECK_TIMEOUT = int(os.getenv('SSL_CHECK_TIMEOUT', 10))

# Schedule Configuration (cron format)
HEALTH_CHECK_HOUR = int(os.getenv('HEALTH_CHECK_HOUR', 9))
HEALTH_CHECK_MINUTE = int(os.getenv('HEALTH_CHECK_MINUTE', 0))
CLEANUP_HOUR = int(os.getenv('CLEANUP_HOUR', 0))
CLEANUP_MINUTE = int(os.getenv('CLEANUP_MINUTE', 0))
