"""
Email sender utility for alert notifications.
Sends email alerts when websites go down.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT

logger = logging.getLogger(__name__)


def send_alert_email(to_email: str, user_name: str, website_url: str) -> bool:
    """
    Send an email alert when a website goes down.
    
    Args:
        to_email: Recipient email address
        user_name: User's name for personalization
        website_url: URL of the website that went down
        
    Returns:
        True if email was sent successfully, False otherwise
    """
    if not EMAIL_USER or not EMAIL_PASS:
        logger.warning("Email credentials not configured, skipping alert")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"⚠️ Website Down Alert: {website_url}"
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        
        # Current timestamp
        check_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Plain text version
        text_content = f"""
Hi {user_name},

Your monitored website is currently DOWN:

Website: {website_url}
Checked at: {check_time}

We'll continue monitoring and notify you when it comes back online.

- WebMonitor Team
        """.strip()
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .alert {{ background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }}
        .url {{ font-family: monospace; background: #f3f4f6; padding: 5px 10px; border-radius: 4px; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>⚠️ Website Down Alert</h2>
        
        <p>Hi {user_name},</p>
        
        <div class="alert">
            <strong>Your monitored website is currently DOWN:</strong>
            <p class="url">{website_url}</p>
            <p><small>Checked at: {check_time}</small></p>
        </div>
        
        <p>We'll continue monitoring and notify you when it comes back online.</p>
        
        <div class="footer">
            <p>- WebMonitor Team</p>
        </div>
    </div>
</body>
</html>
        """.strip()
        
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
        
        logger.info(f"Alert email sent to {to_email} for {website_url}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send alert email: {e}")
        return False


if __name__ == '__main__':
    # Test email sending
    logging.basicConfig(level=logging.INFO)
    print("Email sender module loaded successfully")
