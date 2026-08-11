#!/usr/bin/env python3
"""
RSS News Digest Email Sender

Fetches RSS feeds, summarizes with AI, and sends email digest daily.
Runs via Claude Code Desktop scheduled task.
"""

import os
import sys
import smtplib
import json
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError, HTTPError
import xml.etree.ElementTree as ET
from typing import Dict, List, Tuple

# Setup logging
log_file = Path(__file__).parent / "news_digest.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
def load_env():
    """Load credentials from .env file."""
    env_path = Path(__file__).parent / ".env"

    if not env_path.exists():
        logger.error(f".env file not found at {env_path}")
        sys.exit(1)

    env_vars = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip()

    return env_vars

# RSS Feeds Configuration
RSS_FEEDS = {
    "Technology": [
        "https://feeds.techcrunch.com/",
        "https://www.theverge.com/rss/index.xml",
        "https://feeds.arstechnica.com/arstechnica/index"
    ],
    "Business": [
        "https://feeds.bloomberg.com/markets/news.rss",
        "https://feeds.cnbc.com/cnbc/rss-all/",
        "https://feeds.reuters.com/reuters/businessNews"
    ],
    "Science": [
        "https://feeds.nasa.gov/missions/apollo/rss.xml",
        "https://feeds.nature.com/nature/rss/current",
        "https://www.sciencedaily.com/rss/all.xml"
    ]
}

def fetch_rss_feed(url: str, max_items: int = 5) -> List[Dict]:
    """Fetch and parse RSS feed."""
    try:
        response = urlopen(url, timeout=10)
        tree = ET.parse(response)
        root = tree.getroot()

        items = []
        namespaces = {
            'content': 'http://purl.org/rss/1.0/modules/content/',
            'atom': 'http://www.w3.org/2005/Atom'
        }

        for item in root.findall('.//item')[:max_items]:
            try:
                title_elem = item.find('title')
                link_elem = item.find('link')
                desc_elem = item.find('description')

                if title_elem is not None:
                    items.append({
                        'title': title_elem.text or 'Untitled',
                        'link': link_elem.text if link_elem is not None else '#',
                        'description': desc_elem.text[:200] if desc_elem is not None else 'No description'
                    })
            except Exception as e:
                logger.warning(f"Error parsing RSS item: {e}")
                continue

        return items
    except (URLError, HTTPError, Exception) as e:
        logger.warning(f"Error fetching RSS feed {url}: {e}")
        return []

def summarize_article(title: str, description: str) -> str:
    """Summarize article (basic implementation without external API)."""
    # Simple summary: use description or first 150 chars of title
    if description and description != "No description":
        return description[:200]
    return title[:150]

def fetch_category_news(category: str, feeds: List[str]) -> List[Dict]:
    """Fetch news for a specific category."""
    all_articles = []

    for feed_url in feeds:
        logger.info(f"Fetching {category} from {feed_url}")
        articles = fetch_rss_feed(feed_url, max_items=3)
        all_articles.extend(articles)

    # Deduplicate and limit
    seen_titles = set()
    unique_articles = []

    for article in all_articles:
        if article['title'] not in seen_titles:
            seen_titles.add(article['title'])
            unique_articles.append(article)
            if len(unique_articles) >= 5:
                break

    return unique_articles

def generate_html_email(news_by_category: Dict[str, List[Dict]]) -> str:
    """Generate HTML email content."""
    today = datetime.now().strftime("%Y-%m-%d")

    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }}
            .header h1 {{ color: #0066cc; margin: 0; }}
            .header p {{ color: #666; margin: 10px 0 0 0; }}
            .category {{ margin: 30px 0; }}
            .category h2 {{ color: #0066cc; border-left: 4px solid #0066cc; padding-left: 10px; margin-bottom: 15px; }}
            .article {{ margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }}
            .article h3 {{ margin: 0 0 10px 0; color: #222; }}
            .article p {{ margin: 0 0 10px 0; color: #555; }}
            .article a {{ color: #0066cc; text-decoration: none; }}
            .article a:hover {{ text-decoration: underline; }}
            .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📰 Daily News Digest</h1>
                <p>Latest news from Technology, Business & Science</p>
                <p style="color: #999; font-size: 12px;">{today}</p>
            </div>
    """

    for category, articles in news_by_category.items():
        if articles:
            html += f'<div class="category">\n<h2>{category}</h2>\n'

            for i, article in enumerate(articles, 1):
                summary = summarize_article(article['title'], article['description'])
                html += f"""
                <div class="article">
                    <h3>{i}. {article['title']}</h3>
                    <p>{summary}</p>
                    <a href="{article['link']}" target="_blank">Read More →</a>
                </div>
                """

            html += '</div>\n'

    html += """
            <div class="footer">
                <p>This is an automated email from your Daily News Digest system.</p>
                <p>Manage your preferences in Claude Code Desktop → Schedule settings.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return html

def send_email(smtp_server: str, smtp_port: int, sender: str, app_password: str,
               recipient: str, subject: str, html_body: str) -> bool:
    """Send email via SMTP."""
    try:
        logger.info(f"Connecting to {smtp_server}:{smtp_port}")

        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = recipient

        # Attach HTML
        msg.attach(MIMEText(html_body, 'html'))

        # Send
        with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10) as server:
            logger.info(f"Logging in as {sender}")
            server.login(sender, app_password)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {recipient}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP Authentication Failed - check Gmail App Password")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP Error: {e}")
        return False
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

def main():
    """Main function."""
    logger.info("=" * 60)
    logger.info("Starting Daily News Digest")
    logger.info("=" * 60)

    # Load config
    env_vars = load_env()

    gmail_address = env_vars.get('GMAIL_ADDRESS')
    gmail_password = env_vars.get('GMAIL_APP_PASSWORD')
    recipient_email = env_vars.get('RECIPIENT_EMAIL')

    if not all([gmail_address, gmail_password, recipient_email]):
        logger.error("Missing required environment variables")
        logger.error("Required: GMAIL_ADDRESS, GMAIL_APP_PASSWORD, RECIPIENT_EMAIL")
        sys.exit(1)

    # Fetch news
    logger.info("Fetching news from RSS feeds...")
    news_by_category = {}

    for category, feeds in RSS_FEEDS.items():
        logger.info(f"Processing {category}...")
        articles = fetch_category_news(category, feeds)
        news_by_category[category] = articles
        logger.info(f"  Found {len(articles)} articles")

    # Generate email
    logger.info("Generating email content...")
    today = datetime.now().strftime("%Y-%m-%d")
    subject = f"📰 Daily News Digest - {today}"
    html_body = generate_html_email(news_by_category)

    # Send email
    logger.info("Sending email...")
    success = send_email(
        smtp_server='smtp.gmail.com',
        smtp_port=465,
        sender=gmail_address,
        app_password=gmail_password,
        recipient=recipient_email,
        subject=subject,
        html_body=html_body
    )

    if success:
        logger.info("✅ Daily News Digest completed successfully")
        sys.exit(0)
    else:
        logger.error("❌ Failed to send email")
        sys.exit(1)

if __name__ == '__main__':
    main()
