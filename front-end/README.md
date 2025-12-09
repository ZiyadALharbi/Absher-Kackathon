# AbsherThon - Intelligent Government Services Assistant

> An AI-powered government services health checker integrated into an Absher dashboard clone with a smart chatbot assistant.

## 🎯 Project Overview

AbsherThon is a hackathon project that demonstrates an intelligent assistant ("عون - المساعد الذكي") integrated into a government services dashboard. The assistant can automatically scan, detect, and fix issues with government documents, worker permits, vehicle registrations, and more.

## ✨ Features

### 🤖 Smart Chat Assistant (عون)
- **Chatbot Interface**: Modern chat UI with message bubbles
- **Health Checker**: Comprehensive government services scan
- **Auto-Fix**: One-click automated issue resolution
- **Real-time Updates**: Live progress tracking with animations
- **Invoice Generation**: Random 10-digit invoice numbers

### 📊 Dashboard Features
- **User Authentication**: Secure login system
- **Services Overview**: Quick access to government services
- **Health Score**: Visual representation of account status (0-100)
- **Issue Detection**: Categorized problems with detailed breakdowns
- **RTL Support**: Full Arabic right-to-left layout

### 🔍 Smart Detection Categories
1. **Personal Documents** (الوثائق الشخصية) - Status: ✅ Valid
2. **Vehicles** (المركبات) - Status: ⚠️ Warning
3. **Domestic Workers** (العمالة المنزلية) - Status: ⚠️ Warning
   - Medical Insurance: ✅ Valid
   - Contract: ✅ Valid
   - Iqama: ⚠️ Expires in 5 days
4. **Violations** (المخالفات) - Status: ✅ Valid
5. **Family** (العائلة) - Status: ✅ Valid

## 🚀 Quick Start

### Prerequisites
- Python 3.x
- Node.js 16+ (optional, for Next.js version)
- Modern web browser

### Installation & Running

#### Option 1: Main Dashboard (Recommended)

```bash
# Navigate to frontend directory
cd forntend

# Run the development server
python3 run_site.py
```

Then open your browser to: **http://localhost:8000/dashboard.html**

#### Option 2: Standalone Next.js App (Optional)

```bash
# Navigate to Next.js app directory
cd aun-agent

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

Then open: **http://localhost:3001**

## 🔐 Login Credentials

### Demo User Access

| Field | Value |
|-------|-------|
| **User ID** | `1111` |
| **Password** | `123456` |

> **Note**: These are demo credentials for testing purposes only.

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3**: Modern responsive design
- **JavaScript**: Vanilla JS for interactivity
- **Tailwind CSS**: Utility-first styling via CDN
- **Lucide Icons**: Icon library
- **RTL Support**: Full Arabic layout

### Next.js Version (Standalone)
- **Next.js 14**: React framework
- **TypeScript**: Type-safe development
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Styling system
- **Cairo Font**: Arabic typography

### Backend
- **Python 3**: Simple HTTP server
- **Static Files**: No database required

## 📁 Project Structure

```
AbsherThon/
├── forntend/                    # Main website
│   ├── www.absher.sa/
│   │   ├── dashboard.html       # Main dashboard with chat assistant
│   │   ├── index.html           # Login page
│   │   └── portal/              # Static assets (CSS, JS, images)
│   └── run_site.py              # Python development server
│
├── aun-agent/                   # Standalone Next.js app
│   ├── app/
│   │   ├── page.tsx             # Main health checker component
│   │   ├── layout.tsx           # Root layout with RTL
│   │   └── globals.css          # Global styles
│   ├── lib/
│   │   └── mockData.ts          # Demo data
│   ├── tailwind.config.ts       # Tailwind configuration
│   └── package.json             # Dependencies
│
└── README.md                    # This file
```

## 🎮 How to Use

### Step 1: Login
1. Open http://localhost:8000/
2. Enter User ID: `1111`
3. Enter Password: `123456`
4. Click "دخول" (Login)

### Step 2: Access Chat Assistant
1. Look for the green floating button at bottom-left: "عون - المساعد الذكي"
2. Click the button to open the chat

### Step 3: Start Health Check
1. Click "ابدأ فحص صحتك الحكومية الآن" (Start Health Check)
2. Wait for the 5-step scan to complete (~3 seconds)
3. View your health score (82/100)

### Step 4: Review Issues
1. See categorized results
2. Click "العمالة المنزلية" (Domestic Workers) to expand
3. Review the issue: Iqama expires in 5 days

### Step 5: Auto-Fix
1. Click "إصلاح كل شيء بضغطة واحدة" (Fix Everything)
2. Watch the 3-step automated process:
   - Submit iqama renewal request
   - Pay fees (650 SAR)
   - Update data
3. View success screen with invoice number

### Step 6: Updated Status
1. Score improves from 82 → 98
2. Random 10-digit invoice number generated
3. Toast notification confirms success
4. Dashboard updates automatically

## 🎨 Design Features

- **Modern UI**: Clean, professional interface
- **Smooth Animations**: CSS keyframes and transitions
- **Responsive Design**: Works on all screen sizes
- **Color-Coded Status**: 
  - 🟢 Green: Valid (95+)
  - 🟡 Yellow: Warning (60-94)
  - 🔴 Red: Critical (<60)
- **Interactive Elements**: Hover effects, click animations
- **Arabic Typography**: Cairo font family

## 🔄 Demo Flow Timeline

Total duration: ~15 seconds

1. **Chat Opens** (instant)
2. **Scan Progress** (3 seconds) - 5 steps with progress bar
3. **Dashboard Display** (instant) - Score 82, categorized results
4. **Issue Expansion** (instant) - Worker details shown
5. **Auto-Fix Process** (3 seconds) - 3 automated steps
6. **Success Screen** (instant) - Score 98, invoice number
7. **Dashboard Update** (instant) - Toast notification

## 🧪 Testing Scenarios

### Scenario 1: Complete Flow
✅ Login → Open chat → Start scan → Expand workers → Fix → Success

### Scenario 2: Chat Interaction
✅ View welcome messages → See suggestions → Click health check button

### Scenario 3: Invoice Verification
✅ Fix issues → Verify random 10-digit invoice number → Check payment details

## 🚧 Future Enhancements

- [ ] Real AI chatbot integration (LLM)
- [ ] Multiple user accounts
- [ ] Database integration
- [ ] Real government API connections
- [ ] Multi-language support (English/Arabic)
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Payment gateway integration

## 🤝 Contributing

This is a hackathon project. To contribute:

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Notes for Collaborators

### Development Tips
- Chrome DevTools: F12 for debugging
- Console logs: Check for JavaScript errors
- Network tab: Monitor API calls (future)
- Responsive mode: Test different screen sizes

### Common Issues
1. **Chat button missing**: Refresh page (F5)
2. **Port already in use**: Change port in `run_site.py`
3. **Styling broken**: Check Tailwind CDN connection
4. **Icons missing**: Verify Lucide CDN

### File Organization
- Static assets in `/portal/individuals/assets/`
- Main pages in `/www.absher.sa/`
- All paths are relative for portability

## 📄 License

This is a hackathon demonstration project. All rights reserved.

## 👥 Team

Built for hackathon demonstration purposes.

## 📞 Support

For questions or issues, contact the project team.

---

**Built with ❤️ for the Saudi Hackathon 2024**

**Last Updated**: December 2024
