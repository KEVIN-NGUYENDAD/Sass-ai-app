"""Rate limiting to prevent abuse and cost overruns"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Default: 100 requests per hour per IP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour"],
    storage_uri="memory://"
)

# Specific endpoint limits (prevent abuse)
LIMITS = {
    "/api/scan/ports": "10 per hour",      # Port scanning is expensive
    "/api/scan/wifi-security": "20 per hour",  # WiFi checks
    "/api/scan/password": "50 per hour",   # Password checks
    "/api/scan/network-info": "100 per hour",  # Network info
    "/api/scan/history": "200 per hour",   # History access
}
