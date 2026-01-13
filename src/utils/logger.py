"""
Logging configuration for the AI Radio Content Categorizer.
"""

import os
import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler

from ..core.config import Config


def setup_logging(log_level: str = None) -> logging.Logger:
    """
    Setup logging configuration.
    
    Args:
        log_level: Override log level (DEBUG, INFO, WARNING, ERROR)
        
    Returns:
        Root logger instance
    """
    config = Config()
    
    if log_level is None:
        log_level = config.log_level
    
    # Convert string level to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Get log file path
    log_file = config.get('logging', 'file')
    if log_file:
        log_file = Path(os.path.expanduser(log_file))
        log_file.parent.mkdir(parents=True, exist_ok=True)
    else:
        log_file = config.get_data_dir() / 'logs' / 'app.log'
        log_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Create formatter
    log_format = config.get('logging', 'format', 
                           default='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    formatter = logging.Formatter(log_format)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler with rotation
    max_size = config.get('logging', 'max_size_mb', default=10) * 1024 * 1024
    backup_count = config.get('logging', 'backup_count', default=5)
    
    file_handler = RotatingFileHandler(
        str(log_file),
        maxBytes=max_size,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setLevel(numeric_level)
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Reduce verbosity of third-party libraries
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('googleapiclient').setLevel(logging.WARNING)
    logging.getLogger('google').setLevel(logging.WARNING)
    
    root_logger.info(f"Logging initialized - Level: {log_level}, File: {log_file}")
    
    return root_logger


class ProgressLogger:
    """Helper class for logging progress of batch operations."""
    
    def __init__(self, total: int, operation: str = "Processing"):
        self.total = total
        self.current = 0
        self.operation = operation
        self.logger = logging.getLogger(__name__)
    
    def update(self, message: str = ""):
        """Update progress."""
        self.current += 1
        progress = (self.current / self.total) * 100
        log_msg = f"{self.operation} [{self.current}/{self.total}] ({progress:.1f}%)"
        if message:
            log_msg += f" - {message}"
        self.logger.info(log_msg)
    
    def complete(self, message: str = ""):
        """Mark operation as complete."""
        log_msg = f"{self.operation} complete: {self.current}/{self.total} items"
        if message:
            log_msg += f" - {message}"
        self.logger.info(log_msg)
