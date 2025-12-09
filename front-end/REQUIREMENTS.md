# AbsherThon - Installation Guide

## System Requirements

### Minimum Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher (optional, for Next.js version)
- **npm**: 8.0 or higher (optional, for Next.js version)
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Operating System**: Windows, macOS, or Linux

### Recommended
- **Python**: 3.10+
- **Node.js**: 18.0+
- **RAM**: 4GB minimum
- **Storage**: 500MB free space

---

## Installation Steps

### 1. Main Dashboard (Python)

**No installation required!** The main dashboard uses Python's built-in `http.server` module.

```bash
# Just run:
cd forntend
python3 run_site.py
```

That's it! Open http://localhost:8000/dashboard.html

### 2. Next.js Version (Optional)

If you want to run the standalone Next.js application:

```bash
# Navigate to the Next.js directory
cd aun-agent

# Install dependencies (first time only)
npm install

# Run the development server
npm run dev
```

Open http://localhost:3001

---

## Python Dependencies

### Main Dashboard (forntend/)
**No external packages required** ✅

The project uses only Python's standard library:
- `http.server` - Built-in web server
- `os` - File system operations

### Optional Development Tools
If you want advanced features, you can install:
```bash
pip install flask gunicorn
```

But this is **NOT required** for basic functionality.

---

## Node.js Dependencies (Next.js version only)

The Next.js version (`aun-agent/`) requires the following packages:

### Core Dependencies
```json
{
  "next": "14.2.18",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "framer-motion": "^11.11.11",
  "lucide-react": "^0.460.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.7.2",
  "@types/node": "^22.10.1",
  "@types/react": "^18.2.0",
  "tailwindcss": "^3.4.1",
  "postcss": "^8.4.31",
  "autoprefixer": "^10.4.14"
}
```

All packages are listed in `aun-agent/package.json` and will be installed automatically with `npm install`.

---

## Quick Start Summary

### For Most Users (Main Dashboard):
```bash
cd forntend
python3 run_site.py
# Open http://localhost:8000/dashboard.html
```

**No pip install needed!** ✅

### For Next.js Developers:
```bash
cd aun-agent
npm install
npm run dev
# Open http://localhost:3001
```

---

## Troubleshooting

### Python Issues
- **Python not found**: Install Python from https://www.python.org/downloads/
- **Port 8000 already in use**: Edit `run_site.py` and change the port number

### Node.js Issues  
- **npm not found**: Install Node.js from https://nodejs.org/
- **Installation failed**: Delete `node_modules/` and `package-lock.json`, then run `npm install` again
- **Port 3001 already in use**: Edit `package.json` and change the port in the dev script

---

## External Dependencies (CDN)

The main dashboard loads these from CDN (no installation):

- **Tailwind CSS**: v3.4.1
- **Lucide Icons**: Latest
- **Google Fonts**: Cairo (Arabic font)

These are loaded automatically when you open the page in your browser.

---

## Network Requirements

### Required
- Internet connection for CDN resources (Tailwind, icons, fonts)
- If working offline, you'll need to download and host these assets locally

### Optional
- None - the project runs entirely on localhost

---

## File Permissions

Ensure you have read/write permissions for:
- `forntend/` directory (for Python server)
- `aun-agent/` directory (for Next.js, if using)

---

**All set!** 🚀 You're ready to run the project.
