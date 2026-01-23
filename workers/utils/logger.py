"""
Logging utilities for Python workers.
Provides structured logging with consistent formatting.
"""
import logging
import sys
from datetime import datetime


class WorkerFormatter(logging.Formatter):
    """Custom formatter with emoji prefixes based on log level."""
    
    FORMATS = {
        logging.DEBUG: "🔧 %(asctime)s - %(name)s - %(message)s",
        logging.INFO: "📋 %(asctime)s - %(name)s - %(message)s",
        logging.WARNING: "⚠️ %(asctime)s - %(name)s - %(message)s",
        logging.ERROR: "❌ %(asctime)s - %(name)s - %(message)s",
        logging.CRITICAL: "🚨 %(asctime)s - %(name)s - %(message)s",
    }
    
    def format(self, record):
        log_format = self.FORMATS.get(record.levelno, self.FORMATS[logging.INFO])
        formatter = logging.Formatter(log_format, datefmt='%Y-%m-%d %H:%M:%S')
        return formatter.format(record)


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name (usually __name__)
        level: Logging level
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(WorkerFormatter())
        logger.addHandler(handler)
        
    logger.setLevel(level)
    return logger


def setup_logging(level: int = logging.INFO):
    """
    Setup root logging configuration.
    
    Args:
        level: Logging level for root logger
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add custom handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(WorkerFormatter())
    root_logger.addHandler(handler)
