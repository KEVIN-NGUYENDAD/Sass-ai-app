from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
from security_scanner import NetworkSecurityScanner
from datetime import datetime
import json
import secrets
import re
from functools import wraps

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Security: Rate limiting to prevent DoS attacks
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "10 per minute"]
)

# Security: API token for authentication
API_TOKEN = os.getenv('API_TOKEN', secrets.token_urlsafe(32))
if os.getenv('API_TOKEN') is None:
    print(f"⚠️  WARNING: No API_TOKEN set. Using random token: {API_TOKEN}")
    print("Set API_TOKEN environment variable for production.")

def require_auth(f):
    """Decorator to require API token authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('X-API-Token', '')
        if not token or token != API_TOKEN:
            return jsonify({
                'success': False,
                'error': 'Unauthorized',
                'message': 'Invalid or missing API token'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def is_localhost(host):
    """Check if target is localhost (CRITICAL security restriction)"""
    localhost_variants = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0']
    return host.lower() in localhost_variants

def validate_port_range(ports_str):
    """Validate port range input to prevent injection attacks"""
    if not ports_str or not isinstance(ports_str, str):
        return False
    ports_str = ports_str.strip()
    if len(ports_str) > 100:  # Limit length
        return False
    # Allow: 80, 80,443,8080, 1-1000, 1-65535
    if re.match(r'^[\d,\-\s]+$', ports_str):
        return True
    return False

def validate_hostname(hostname):
    """Validate hostname/IP input"""
    if not hostname or not isinstance(hostname, str):
        return False
    hostname = hostname.strip()
    if len(hostname) > 255:
        return False
    # Allow hostnames, IPs, localhost
    if re.match(r'^[a-zA-Z0-9\.\:\-_]+$', hostname):
        return True
    return False

def validate_password(password):
    """Validate password input"""
    if not password or not isinstance(password, str):
        return False
    if len(password) < 1 or len(password) > 128:
        return False
    return True

def validate_ssid(ssid):
    """Validate WiFi SSID input"""
    if not isinstance(ssid, str):
        return False
    if len(ssid) > 32:  # WiFi SSID max 32 chars
        return False
    return True

# Initialize scanner
scanner = NetworkSecurityScanner()

# Store scan history in memory (thực tế nên dùng database)
scan_history = []

@app.route('/api/health', methods=['GET'])
@limiter.limit("60 per minute")
def health_check():
    """Health check endpoint (rate limited)"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/scan/ports', methods=['POST'])
@require_auth
@limiter.limit("5 per minute")
def scan_ports():
    """Quét cổng mở trên thiết bị (CRITICAL: localhost only, rate limited)"""
    try:
        data = request.json or {}
        target_host = data.get('target', 'localhost').strip()
        ports = data.get('ports', '1-1000').strip()

        # INPUT VALIDATION: Validate inputs
        if not validate_hostname(target_host):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid hostname format'
            }), 400

        if not validate_port_range(ports):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid port range format (use: 80 or 80,443 or 1-1000)'
            }), 400

        # CRITICAL FIX: Only allow scanning localhost
        if not is_localhost(target_host):
            return jsonify({
                'success': False,
                'error': 'Security restriction',
                'message': 'Port scanning is only allowed on localhost (127.0.0.1)'
            }), 403

        print(f"[*] Scanning ports on {target_host}...")

        result = scanner.scan_ports(target_host, ports)

        scan_record = {
            'type': 'port_scan',
            'target': target_host,
            'timestamp': datetime.now().isoformat(),
            'result': result
        }
        scan_history.append(scan_record)

        return jsonify({
            'success': True,
            'data': result,
            'message': f'Scan completed for {target_host}'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Port scan failed'
        }), 400

@app.route('/api/scan/password', methods=['POST'])
@require_auth
@limiter.limit("10 per minute")
def check_password_strength():
    """Kiểm tra độ mạnh của mật khẩu (rate limited, validated input)"""
    try:
        data = request.json or {}
        password = data.get('password', '')

        if not password:
            return jsonify({
                'success': False,
                'error': 'Password is required'
            }), 400

        # INPUT VALIDATION: Validate password
        if not validate_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Password must be 1-128 characters'
            }), 400

        result = scanner.check_password_strength(password)

        scan_record = {
            'type': 'password_check',
            'timestamp': datetime.now().isoformat(),
            'result': result
        }
        scan_history.append(scan_record)

        return jsonify({
            'success': True,
            'data': result,
            'message': 'Password strength check completed'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/scan/network-info', methods=['GET'])
@require_auth
@limiter.limit("20 per minute")
def get_network_info():
    """Lấy thông tin mạng hiện tại (HIGH: auth required, info disclosure, rate limited)"""
    try:
        info = scanner.get_network_info()

        # MEDIUM FIX: Limit sensitive information exposure
        safe_info = {
            'hostname': info.get('hostname'),
            'os': info.get('os'),
            'message': 'Network info limited to authorized users'
        }

        return jsonify({
            'success': True,
            'data': safe_info,
            'message': 'Network info retrieved'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/scan/wifi-security', methods=['POST'])
@require_auth
@limiter.limit("8 per minute")
def check_wifi_security():
    """Kiểm tra an ninh WiFi (rate limited, validated input)"""
    try:
        data = request.json or {}
        ssid = data.get('ssid', '').strip()
        password = data.get('password', '').strip()

        # INPUT VALIDATION: Validate SSID and password
        if not validate_ssid(ssid):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid SSID (max 32 characters)'
            }), 400

        if not validate_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Password must be 1-128 characters'
            }), 400

        result = scanner.check_wifi_security(ssid, password)

        scan_record = {
            'type': 'wifi_check',
            'ssid': ssid,
            'timestamp': datetime.now().isoformat(),
            'result': result
        }
        scan_history.append(scan_record)

        return jsonify({
            'success': True,
            'data': result,
            'message': 'WiFi security check completed'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/scan/history', methods=['GET'])
@require_auth
@limiter.limit("30 per minute")
def get_scan_history():
    """Lấy lịch sử các lần quét (rate limited)"""
    try:
        limit = request.args.get('limit', 50, type=int)
        # Validate limit parameter
        if limit < 1 or limit > 500:
            limit = 50
        return jsonify({
            'success': True,
            'data': scan_history[-limit:],
            'total': len(scan_history)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/scan/clear-history', methods=['POST'])
@require_auth
@limiter.limit("5 per minute")
def clear_history():
    """Xóa lịch sử quét (rate limited)"""
    global scan_history
    scan_history = []

    return jsonify({
        'success': True,
        'message': 'History cleared'
    }), 200

@app.route('/api/scan/quick-audit', methods=['POST'])
@require_auth
@limiter.limit("3 per minute")
def quick_audit():
    """Audit nhanh toàn bộ an ninh (CRITICAL: localhost only, rate limited)"""
    try:
        data = request.json or {}
        target_host = data.get('target', 'localhost').strip()

        # INPUT VALIDATION: Validate hostname
        if not validate_hostname(target_host):
            return jsonify({
                'success': False,
                'error': 'Invalid input',
                'message': 'Invalid hostname format'
            }), 400

        # CRITICAL FIX: Only allow auditing localhost
        if not is_localhost(target_host):
            return jsonify({
                'success': False,
                'error': 'Security restriction',
                'message': 'Audit is only allowed on localhost (127.0.0.1)'
            }), 403

        audit_result = {
            'timestamp': datetime.now().isoformat(),
            'target': target_host,
            'checks': {}
        }

        # Check network info
        info = scanner.get_network_info()
        audit_result['checks']['network_info'] = {
            'hostname': info.get('hostname'),
            'os': info.get('os')
        }

        # Check common ports
        audit_result['checks']['port_scan'] = scanner.scan_ports(target_host, '21,22,23,80,443,445,3306,5432,5900')

        scan_history.append({
            'type': 'quick_audit',
            'timestamp': audit_result['timestamp'],
            'result': audit_result
        })

        return jsonify({
            'success': True,
            'data': audit_result,
            'message': 'Quick audit completed'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/recommendations', methods=['GET'])
@limiter.limit("30 per minute")
def get_security_recommendations():
    """Đề xuất cải thiện an ninh (rate limited)"""
    recommendations = {
        'network': [
            'Đặt mật khẩu WiFi mạnh (ít nhất 12 ký tự)',
            'Bật WPA3 hoặc WPA2 encryption',
            'Tắt WPS (WiFi Protected Setup)',
            'Ẩn SSID broadcast',
            'Cập nhật firmware router thường xuyên'
        ],
        'ports': [
            'Đóng các cổng không cần thiết',
            'Chỉ mở cổng SSH (22) cho IP tin cậy',
            'Sử dụng Non-standard ports cho services',
            'Bật firewall'
        ],
        'passwords': [
            'Sử dụng mật khẩu ≥ 12 ký tự',
            'Bao gồm chữ hoa, số, ký tự đặc biệt',
            'Không dùng từ điển hoặc thông tin cá nhân',
            'Dùng password manager',
            'Bật 2FA/MFA ở mọi nơi có thể'
        ],
        'devices': [
            'Cập nhật OS & ứng dụng thường xuyên',
            'Cài đặt antivirus/malware protection',
            'Chỉ tải từ official sources',
            'Tắt Bluetooth/WiFi khi không dùng',
            'Sử dụng VPN trên WiFi công cộng'
        ]
    }

    return jsonify({
        'success': True,
        'data': recommendations
    }), 200

@app.before_request
def security_before_request():
    """HIGH: Enforce HTTPS in production"""
    if os.getenv('FLASK_ENV') == 'production' and not request.is_secure:
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)

@app.after_request
def security_headers(response):
    """HIGH: Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested resource does not exist'
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': str(error)
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
