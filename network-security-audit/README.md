# 🔒 Network Security Audit Tool

Family Network Security Audit Tool - Kiểm tra an ninh mạng cho gia đình

## Features

- 🔍 **Port Scanner** - Quét cổng mở
- 🔐 **Password Checker** - Kiểm tra độ mạnh mật khẩu
- 📡 **WiFi Security** - Kiểm tra bảo mật WiFi
- ℹ️ **Network Info** - Thông tin mạng hệ thống
- 📜 **Scan History** - Lịch sử quét
- 📊 **Dashboard** - Tổng quan an ninh

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React 18
- **Deploy**: Render

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Project Structure

```
network-security-audit/
├── backend/
│   ├── app.py                 # Flask main app
│   ├── security_scanner.py    # Security scanning logic
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── Procfile              # Render deployment
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── App.css           # Styling
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── index.js
│   │       └── AllComponents.jsx  # All React components
│   ├── public/
│   │   └── index.html
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
All endpoints (except `/api/health`) require API token header:
```
X-API-Token: <your-token>
```

### Health Check
- `GET /api/health` - Check if backend is running (no auth required)

### Port Scanning
- `POST /api/scan/ports` - Scan open ports (🔐 auth required)
  - ⚠️ Target restricted to localhost/127.0.0.1
  - Body: `{ target: "localhost", ports: "1-1000" }`
  - Returns: 403 Forbidden if target is not localhost

### Password Strength
- `POST /api/scan/password` - Check password strength (🔐 auth required)
  - Body: `{ password: "MyPassword123!" }`

### WiFi Security
- `POST /api/scan/wifi-security` - Check WiFi security (🔐 auth required)
  - Body: `{ ssid: "MyWiFi", password: "MyPassword123!" }`

### Network Info
- `GET /api/scan/network-info` - Get network information (🔐 auth required)
  - Limited data (hostname, OS only) to prevent information disclosure

### Scan History
- `GET /api/scan/history` - Get scan history (🔐 auth required)
- `POST /api/scan/clear-history` - Clear history (🔐 auth required)

### Quick Audit
- `POST /api/scan/quick-audit` - Run quick security audit (🔐 auth required)
  - ⚠️ Audit restricted to localhost/127.0.0.1
  - Returns: 403 Forbidden if target is not localhost

### Recommendations
- `GET /api/recommendations` - Get security recommendations (public, no auth required)

## Development

### Run Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build
```

## Deployment

### Render.com

1. Push code to GitHub
2. Connect GitHub repository to Render
3. Set up environment variables:
   - `FLASK_ENV=production`
   - `DEBUG=False`
4. Render automatically deploys using `Procfile`

## Security Implementation

### 🔐 CRITICAL Fixes
- **Port Scanning Restriction**: Scanning limited to localhost/127.0.0.1 only (prevents external reconnaissance)
- **API Token Authentication**: All sensitive endpoints require X-API-Token header
- **Localhost Validation**: Dedicated function prevents abuse of port scanning and audit features

### 🟠 HIGH Priority Fixes
- **HTTPS Enforcement**: Production environment enforces HTTPS (automatic redirect from HTTP)
- **Security Headers**: Comprehensive security header middleware
  - X-Content-Type-Options: nosniff (prevent MIME type sniffing)
  - X-XSS-Protection: 1; mode=block (legacy XSS protection)
  - X-Frame-Options: DENY (clickjacking prevention)
  - Strict-Transport-Security: HSTS for HTTPS enforcement
  - Content-Security-Policy: Restricts script and style sources
- **Authentication Required**: All scan endpoints require API token
- **Information Disclosure Control**: Network information endpoint restricted to authenticated users

### 🟡 Frontend Security
- **HTTPS Enforcement**: Application redirects to HTTPS on non-localhost deployments
- **API Token Support**: Automatic token header injection via X-API-Token
- **Environment-Aware URL**: Dynamic API URL selection (localhost vs production)
- **Secure Configuration**: Environment variable support for API tokens

### Authentication Setup
1. Backend generates API_TOKEN on startup (or from environment variable)
2. Frontend reads REACT_APP_API_TOKEN from environment
3. All authenticated requests include: `X-API-Token: <token>`
4. 401 Unauthorized response if token missing or invalid

**Example:**
```bash
# Set API token for development
export REACT_APP_API_TOKEN="your-generated-token"
npm start
```

## Security Notes

⚠️ **For Family Use Only**
- This tool is designed for family network security audits
- Only use on networks you own or have permission to test
- Unauthorized network scanning may be illegal in your jurisdiction
- In production, restrict API access to authenticated users only
- Use strong, unique API tokens in production environments

## License

MIT License - Feel free to use and modify

## Support

For issues or questions, please refer to the documentation or create an issue on GitHub.
