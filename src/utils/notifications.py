"""
Termux notification support for the AI Radio Content Categorizer.
Uses termux-notification API for Android notifications.
"""

import os
import subprocess
import logging
from typing import Optional

from ..core.config import Config

logger = logging.getLogger(__name__)


class TermuxNotifier:
    """Send notifications via Termux API."""
    
    def __init__(self):
        self.config = Config()
        self.enabled = os.getenv('TERMUX_NOTIFICATIONS', 'true').lower() == 'true'
        self._termux_available = self._check_termux()
    
    def _check_termux(self) -> bool:
        """Check if Termux API is available."""
        try:
            result = subprocess.run(
                ['which', 'termux-notification'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def notify(self, title: str, content: str, 
               notification_id: str = "ai-radio",
               priority: str = "default",
               ongoing: bool = False,
               action: str = None) -> bool:
        """
        Send a notification.
        
        Args:
            title: Notification title
            content: Notification content
            notification_id: Unique ID for updating notifications
            priority: min, low, default, high, max
            ongoing: Whether notification should be ongoing
            action: Action button text
            
        Returns:
            True if notification was sent successfully
        """
        if not self.enabled or not self._termux_available:
            logger.debug(f"Notification (disabled): {title} - {content}")
            return False
        
        try:
            cmd = [
                'termux-notification',
                '--id', notification_id,
                '--title', title,
                '--content', content,
                '--priority', priority,
            ]
            
            if ongoing:
                cmd.append('--ongoing')
            
            if action:
                cmd.extend(['--action', action])
            
            result = subprocess.run(cmd, capture_output=True, timeout=10)
            
            if result.returncode == 0:
                logger.debug(f"Notification sent: {title}")
                return True
            else:
                logger.warning(f"Notification failed: {result.stderr.decode()}")
                return False
        
        except subprocess.TimeoutExpired:
            logger.warning("Notification timed out")
            return False
        except Exception as e:
            logger.warning(f"Failed to send notification: {e}")
            return False
    
    def notify_start(self, message: str = "Starting content processing..."):
        """Send notification when processing starts."""
        return self.notify(
            title="AI Radio Categorizer",
            content=message,
            notification_id="ai-radio-status",
            ongoing=True
        )
    
    def notify_progress(self, current: int, total: int, category: str = ""):
        """Update progress notification."""
        content = f"Processing {current}/{total}"
        if category:
            content += f" - Current: {category}"
        
        return self.notify(
            title="AI Radio Categorizer",
            content=content,
            notification_id="ai-radio-status",
            ongoing=True
        )
    
    def notify_complete(self, processed: int, uploaded: int, failed: int = 0):
        """Send completion notification."""
        content = f"Done! Processed: {processed}, Uploaded: {uploaded}"
        if failed > 0:
            content += f", Failed: {failed}"
        
        return self.notify(
            title="AI Radio Categorizer Complete",
            content=content,
            notification_id="ai-radio-status",
            priority="high"
        )
    
    def notify_error(self, error: str):
        """Send error notification."""
        return self.notify(
            title="AI Radio Categorizer Error",
            content=error[:200],  # Truncate long errors
            notification_id="ai-radio-error",
            priority="high"
        )
    
    def clear(self, notification_id: str = "ai-radio-status"):
        """Clear a notification."""
        if not self._termux_available:
            return False
        
        try:
            subprocess.run(
                ['termux-notification-remove', notification_id],
                capture_output=True,
                timeout=5
            )
            return True
        except Exception:
            return False


class TermuxToast:
    """Display toast messages via Termux API."""
    
    def __init__(self):
        self._termux_available = self._check_termux()
    
    def _check_termux(self) -> bool:
        """Check if Termux toast is available."""
        try:
            result = subprocess.run(
                ['which', 'termux-toast'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def show(self, message: str, short: bool = True) -> bool:
        """Show a toast message."""
        if not self._termux_available:
            logger.debug(f"Toast (disabled): {message}")
            return False
        
        try:
            cmd = ['termux-toast']
            if short:
                cmd.extend(['-s', 'short'])
            else:
                cmd.extend(['-s', 'long'])
            cmd.append(message)
            
            subprocess.run(cmd, capture_output=True, timeout=5)
            return True
        except Exception as e:
            logger.warning(f"Failed to show toast: {e}")
            return False


class TermuxVibrate:
    """Vibrate device via Termux API."""
    
    @staticmethod
    def vibrate(duration_ms: int = 500, force: bool = False) -> bool:
        """Vibrate the device."""
        try:
            cmd = ['termux-vibrate', '-d', str(duration_ms)]
            if force:
                cmd.append('-f')
            
            subprocess.run(cmd, capture_output=True, timeout=5)
            return True
        except Exception:
            return False
