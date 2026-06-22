# SK Coder - Professional Web IDE

A full-featured, production-ready web-based IDE built with React, TypeScript, and modern web technologies.

## Features

- **Code Editor** - Monaco Editor with syntax highlighting for 50+ languages
- **File Explorer** - Complete file management system
- **Multi-Terminal** - SK-Shell, Python, Node.js, Java, and SK-AI terminals
- **Live Preview** - Real-time HTML/CSS/JavaScript preview
- **AI Chat** - Integrated AI assistance panel
- **Cloud Shell** - Cloud command execution
- **Settings Panel** - Customizable editor preferences
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Theme** - Professional dark IDE design

## Quick Start

### Local Development

```bash
git clone https://github.com/RaoSaqlainM/sk-coder-web-final
cd sk-coder-web-final
npm install --legacy-peer-deps
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run serve
```

## Deployment

### Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Connect your GitHub account
4. Select the `sk-coder-web-final` repository
5. Click "Deploy"

Vercel will automatically build and deploy your app.

## Project Structure

```
SK-Coder-Web-Final/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── ide/             # IDE-specific components
│   ├── pages/               # Page components
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment config
└── dist/                    # Build output
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **XTerm.js** - Terminal emulation
- **Zustand** - State management
- **Radix UI** - Component library
- **Wouter** - Routing

## Environment Variables

No environment variables required for local development.

## Building Android APK

This project includes Capacitor configuration for building native Android APKs.

### Prerequisites

- Node.js 18+
- Android Studio
- Java 17+

### Steps

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Then build the APK in Android Studio.

## Issues & Fixes

All known issues have been resolved:
- ✅ Removed all Replit dependencies and plugins
- ✅ Fixed package.json catalog references
- ✅ Fixed TypeScript configuration
- ✅ Removed AI detection and watermarks
- ✅ Production-ready build configuration

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
