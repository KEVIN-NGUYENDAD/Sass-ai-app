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

### Health Check
- `GET /api/health` - Check if backend is running

### Port Scanning
- `POST /api/scan/ports` - Scan open ports
  - Body: `{ target: "localhost", ports: "1-1000" }`

### Password Strength
- `POST /api/scan/password` - Check password strength
  - Body: `{ password: "MyPassword123!" }`

### WiFi Security
- `POST /api/scan/wifi-security` - Check WiFi security
  - Body: `{ ssid: "MyWiFi", password: "MyPassword123!" }`

### Network Info
- `GET /api/scan/network-info` - Get network information

### Scan History
- `GET /api/scan/history` - Get scan history
- `POST /api/scan/clear-history` - Clear history

### Quick Audit
- `POST /api/scan/quick-audit` - Run quick security audit

### Recommendations
- `GET /api/recommendations` - Get security recommendations

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

## Security Notes

⚠️ **For Family Use Only**
- This tool is designed for family network security audits
- Only use on networks you own or have permission to test
- Unauthorized network scanning may be illegal in your jurisdiction

## License

MIT License - Feel free to use and modify

## Support

For issues or questions, please refer to the documentation or create an issue on GitHub.
