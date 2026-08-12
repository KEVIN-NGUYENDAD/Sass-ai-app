import socket
import re
import string
import nmap
import psutil
import subprocess
import platform
from typing import Dict, List, Tuple

class NetworkSecurityScanner:
    """
    Lớp chính để quét an ninh mạng cho gia đình
    """

    def __init__(self):
        self.common_ports = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            110: 'POP3',
            143: 'IMAP',
            443: 'HTTPS',
            445: 'SMB',
            3306: 'MySQL',
            3389: 'RDP',
            5432: 'PostgreSQL',
            5900: 'VNC',
            8080: 'HTTP-Alt',
            8443: 'HTTPS-Alt'
        }

    def scan_ports(self, target: str, port_range: str = '1-1000') -> Dict:
        """
        Quét cổng mở trên thiết bị

        Args:
            target: IP hoặc hostname cần quét
            port_range: Dải cổng (vd: '1-1000' hoặc '21,22,80,443')

        Returns:
            Dict chứa kết quả quét
        """
        try:
            open_ports = []
            closed_ports = []

            # Parse port range
            ports_to_scan = self._parse_port_range(port_range)

            for port in ports_to_scan:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    result = sock.connect_ex((target, port))
                    sock.close()

                    if result == 0:
                        service = self.common_ports.get(port, 'Unknown')
                        open_ports.append({
                            'port': port,
                            'service': service,
                            'status': 'OPEN',
                            'risk': self._get_port_risk(port, service)
                        })
                    else:
                        closed_ports.append({
                            'port': port,
                            'status': 'CLOSED'
                        })
                except socket.error:
                    pass

            # Tính điểm an ninh
            security_score = self._calculate_port_security_score(open_ports)

            return {
                'target': target,
                'open_ports': open_ports,
                'closed_ports_count': len(closed_ports),
                'total_ports_scanned': len(ports_to_scan),
                'security_score': security_score,
                'recommendations': self._get_port_recommendations(open_ports)
            }

        except Exception as e:
            return {
                'error': str(e),
                'target': target
            }

    def check_password_strength(self, password: str) -> Dict:
        """
        Kiểm tra độ mạnh của mật khẩu

        Args:
            password: Mật khẩu cần kiểm tra

        Returns:
            Dict chứa điểm số và lời khuyên
        """
        score = 0
        feedback = []

        # Độ dài
        if len(password) >= 8:
            score += 1
        else:
            feedback.append('Mật khẩu quá ngắn (< 8 ký tự)')

        if len(password) >= 12:
            score += 1

        if len(password) >= 16:
            score += 1

        # Chữ hoa
        if re.search(r'[A-Z]', password):
            score += 1
        else:
            feedback.append('Thiếu chữ hoa (A-Z)')

        # Chữ thường
        if re.search(r'[a-z]', password):
            score += 1
        else:
            feedback.append('Thiếu chữ thường (a-z)')

        # Số
        if re.search(r'\d', password):
            score += 1
        else:
            feedback.append('Thiếu số (0-9)')

        # Ký tự đặc biệt
        if re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
            score += 2
        else:
            feedback.append('Thiếu ký tự đặc biệt (!@#$%...)')

        # Không có từ điển phổ biến
        common_passwords = ['password', '123456', 'abc123', 'qwerty', 'letmein']
        if password.lower() in common_passwords:
            score = 0
            feedback.append('Mật khẩu quá phổ biến!')

        # Không có thông tin cá nhân
        if any(word in password.lower() for word in ['abc', 'xyz', 'user', 'admin', 'pass']):
            score = max(0, score - 1)
            feedback.append('Chứa từ phổ biến')

        # Tính percentile
        strength_level = 'Yếu'
        color = 'red'
        if score >= 9:
            strength_level = 'Rất Mạnh'
            color = 'green'
        elif score >= 7:
            strength_level = 'Mạnh'
            color = 'lime'
        elif score >= 5:
            strength_level = 'Trung Bình'
            color = 'yellow'

        return {
            'password_length': len(password),
            'score': min(score, 10),
            'strength': strength_level,
            'color': color,
            'feedback': feedback,
            'recommendations': [
                'Sử dụng ít nhất 12 ký tự',
                'Kết hợp chữ hoa, thường, số, ký tự đặc biệt',
                'Tránh từ điển hoặc thông tin cá nhân',
                'Sử dụng password manager để tạo mật khẩu ngẫu nhiên'
            ]
        }

    def check_wifi_security(self, ssid: str, password: str) -> Dict:
        """
        Kiểm tra an ninh WiFi

        Args:
            ssid: Tên WiFi
            password: Mật khẩu WiFi

        Returns:
            Dict chứa đánh giá an ninh
        """
        issues = []
        score = 100

        # Kiểm tra SSID
        if not ssid:
            issues.append('SSID rỗng')
            score -= 10

        if ssid.lower() == 'default':
            issues.append('SSID mặc định - nên thay đổi')
            score -= 20

        # Kiểm tra độ dài SSID
        if len(ssid) < 8:
            issues.append('SSID quá ngắn - nên sử dụng ≥8 ký tự')
            score -= 15

        # Kiểm tra mật khẩu WiFi
        pwd_result = self.check_password_strength(password)

        if pwd_result['score'] < 5:
            issues.append('Mật khẩu WiFi yếu')
            score -= 30

        # Đề xuất
        recommendations = [
            'Sử dụng WPA3 encryption (WPA2 nếu không hỗ trợ WPA3)',
            'Đặt mật khẩu mạnh ≥ 12 ký tự',
            'Bật tường lửa router',
            'Tắt WPS (WiFi Protected Setup)',
            'Cập nhật firmware router thường xuyên',
            'Ẩn SSID broadcast (optional)',
            'Sử dụng Static IP cho các device quan trọng',
            'Thiết lập MAC filtering nếu cần'
        ]

        return {
            'ssid': ssid,
            'security_score': max(0, score),
            'issues': issues if issues else ['Không phát hiện vấn đề rõ ràng'],
            'password_strength': pwd_result['strength'],
            'recommendations': recommendations
        }

    def get_network_info(self) -> Dict:
        """Lấy thông tin mạng hiện tại"""
        try:
            info = {}

            # Thông tin network interfaces
            interfaces = psutil.net_if_addrs()
            info['interfaces'] = {}

            for interface_name, interface_addrs in interfaces.items():
                info['interfaces'][interface_name] = []
                for addr in interface_addrs:
                    info['interfaces'][interface_name].append({
                        'family': addr.family.name,
                        'address': addr.address,
                        'netmask': addr.netmask,
                        'broadcast': addr.broadcast
                    })

            # Network stats
            net_stats = psutil.net_if_stats()
            info['network_stats'] = {}
            for interface, stats in net_stats.items():
                info['network_stats'][interface] = {
                    'is_up': stats.isup,
                    'mtu': stats.mtu,
                    'speed': stats.speed,
                    'packets_sent': stats.packets_sent,
                    'packets_recv': stats.packets_recv
                }

            # CPU & Memory
            info['system'] = {
                'platform': platform.system(),
                'hostname': socket.gethostname(),
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            }

            return info

        except Exception as e:
            return {'error': str(e)}

    def _parse_port_range(self, port_range: str) -> List[int]:
        """Parse chuỗi port range thành danh sách"""
        ports = []

        for part in port_range.split(','):
            part = part.strip()
            if '-' in part:
                start, end = part.split('-')
                ports.extend(range(int(start), int(end) + 1))
            else:
                ports.append(int(part))

        return sorted(list(set(ports)))

    def _get_port_risk(self, port: int, service: str) -> str:
        """Xác định mức độ rủi ro của cổng"""
        high_risk_ports = [21, 23, 445, 3389]
        medium_risk_ports = [22, 3306, 5432, 5900]

        if port in high_risk_ports:
            return 'HIGH'
        elif port in medium_risk_ports:
            return 'MEDIUM'
        elif port in [80, 443, 8080, 8443]:
            return 'LOW'
        else:
            return 'UNKNOWN'

    def _calculate_port_security_score(self, open_ports: List[Dict]) -> int:
        """Tính điểm an ninh dựa trên cổng mở"""
        score = 100

        for port in open_ports:
            if port['risk'] == 'HIGH':
                score -= 30
            elif port['risk'] == 'MEDIUM':
                score -= 15
            elif port['risk'] == 'LOW':
                score -= 5

        return max(0, score)

    def _get_port_recommendations(self, open_ports: List[Dict]) -> List[str]:
        """Đưa ra đề xuất dựa trên cổng mở"""
        recommendations = []

        if not open_ports:
            recommendations.append('✓ Không tìm thấy cổng mở - Tuyệt vời!')
            return recommendations

        for port in open_ports:
            service = port['service']

            if port['port'] == 21:
                recommendations.append('❌ Cổng FTP (21) mở - Bật SFTP thay vì FTP')
            elif port['port'] == 22:
                recommendations.append('⚠ Cổng SSH (22) mở - Chỉ cho phép từ IP tin cậy')
            elif port['port'] == 23:
                recommendations.append('❌ Cổng Telnet (23) mở - TẮT NGAY! Dùng SSH thay vì Telnet')
            elif port['port'] == 445:
                recommendations.append('❌ Cổng SMB (445) mở - Rủi ro cao, hạn chế quyền truy cập')
            elif port['port'] == 3389:
                recommendations.append('⚠ Cổng RDP (3389) mở - Chỉ cho phép từ mạng nội bộ')
            elif port['port'] in [80, 443]:
                recommendations.append(f'ℹ Cổng HTTP/HTTPS ({port["port"]}) mở - Bình thường cho web server')

        return recommendations
