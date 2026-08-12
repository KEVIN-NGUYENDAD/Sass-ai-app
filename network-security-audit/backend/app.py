from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from security_scanner import NetworkSecurityScanner
from datetime import datetime
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize scanner
scanner = NetworkSecurityScanner()

# Store scan history in memory (thực tế nên dùng database)
scan_history = []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/scan/ports', methods=['POST'])
def scan_ports():
    """Quét cổng mở trên thiết bị"""
    try:
        data = request.json
        target_host = data.get('target', 'localhost')
        ports = data.get('ports', '1-1000')

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
def check_password_strength():
    """Kiểm tra độ mạnh của mật khẩu"""
    try:
        data = request.json
        password = data.get('password', '')

        if not password:
            return jsonify({
                'success': False,
                'error': 'Password is required'
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
def get_network_info():
    """Lấy thông tin mạng hiện tại"""
    try:
        info = scanner.get_network_info()

        return jsonify({
            'success': True,
            'data': info,
            'message': 'Network info retrieved'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/scan/wifi-security', methods=['POST'])
def check_wifi_security():
    """Kiểm tra an ninh WiFi"""
    try:
        data = request.json
        ssid = data.get('ssid', '')
        password = data.get('password', '')

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
def get_scan_history():
    """Lấy lịch sử các lần quét"""
    try:
        limit = request.args.get('limit', 50, type=int)
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
def clear_history():
    """Xóa lịch sử quét"""
    global scan_history
    scan_history = []

    return jsonify({
        'success': True,
        'message': 'History cleared'
    }), 200

@app.route('/api/scan/quick-audit', methods=['POST'])
def quick_audit():
    """Audit nhanh toàn bộ an ninh"""
    try:
        data = request.json
        target_host = data.get('target', 'localhost')

        audit_result = {
            'timestamp': datetime.now().isoformat(),
            'target': target_host,
            'checks': {}
        }

        # Check network info
        audit_result['checks']['network_info'] = scanner.get_network_info()

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
def get_security_recommendations():
    """Đề xuất cải thiện an ninh"""
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
