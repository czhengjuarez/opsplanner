# Ops Weekly Planner

A modern, AI-powered weekly planning tool for DesignOps professionals, built with React, TypeScript, and deployed on Cloudflare Workers.

## 🌟 Features

### Core Planning Tools
- **Weekly Priorities & Notes** - Set and track your top initiatives for the week
- **Daily Check-ins** - Monday through Friday task management with completion tracking
- **Problem Solving Framework** - Document issues with 3 solution ideas each
- **Communication Tracker** - Manage weekly communication tasks and practices
- **PDF Export** - Download your entire weekly plan as a formatted PDF

### 🤖 AI-Powered Communication Templates
Generate professional communication templates instantly using Cloudflare Workers AI:
- Click the sparkle ✨ icon next to any communication task
- Add optional context to customize the template
- View templates in **Formatted** (rich text) or **Markdown** mode
- **Dual Copy Options**:
  - **Copy Plain Text** - Clean text for any platform
  - **Copy Rich Text** - HTML formatting for email clients (Gmail, Outlook, Slack)

### Data Persistence
- All data stored locally in browser (localStorage)
- No server-side storage - your data stays private
- Automatic save on every change

## 🚀 Live Demo

**Production URL**: [https://ops-planner.coscient.workers.dev](https://ops-planner.coscient.workers.dev)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Markdown Rendering**: react-markdown
- **Backend**: Cloudflare Workers
- **AI**: Cloudflare Workers AI (Llama 3.1 8B)
- **Deployment**: Cloudflare Workers with Assets

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/czhengjuarez/opsplanner.git
cd opsplanner

# Install dependencies
npm install

# Build the project
npm run build
```

## 🏃 Development

### Local Development Server

```bash
# Start Cloudflare Workers dev server with hot reload
npm run workers:dev
```

The app will be available at `http://localhost:8787`

### Standard Vite Dev Server (without AI features)

```bash
npm run dev
```

## 🚢 Deployment

### Deploy to Cloudflare Workers

```bash
# Build and deploy to production
npm run workers:deploy

# Deploy to specific environment
npm run workers:deploy -- --env production
```

### Configuration

The `wrangler.toml` file contains the Cloudflare Workers configuration:

```toml
name = "ops-planner"
main = "worker/index.ts"
compatibility_date = "2025-07-26"

[ai]
binding = "AI"  # Enables Workers AI

[assets]
directory = "./dist"
binding = "ASSETS"
```

## 📝 Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run workers:dev` - Start Workers dev server with AI
- `npm run workers:deploy` - Deploy to Cloudflare Workers
- `npm run workers:build` - Build for Workers deployment

## 🔑 Environment Setup

No environment variables required! The app uses:
- Cloudflare Workers AI (requires Cloudflare account)
- Browser localStorage for data persistence

## 🏗️ Project Structure

```
opsplanner/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Header.tsx       # App header with week navigation
│   │   └── AICommTemplateGenerator.tsx  # AI template modal
│   ├── hooks/
│   │   └── useLocalStorage.ts  # localStorage hook
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── worker/
│   └── index.ts             # Cloudflare Workers entry point
├── dist/                    # Build output
├── wrangler.toml            # Workers configuration
└── package.json
```

## 🎨 Key Components

### AICommTemplateGenerator
AI-powered modal for generating communication templates with:
- Context input for customization
- Formatted/Markdown view toggle
- Dual copy functionality (plain text & rich HTML)
- Markdown to HTML conversion

### Communication Section
Weekly communication task tracker with:
- Checkbox completion tracking
- AI assist button (sparkle icon)
- Additional notes section
- Custom task creation

## ⚠️ Important Notes

### Workers AI Usage
- Workers AI incurs usage charges even in local development
- Charges apply to your Cloudflare account
- Monitor usage in Cloudflare dashboard

### Browser Compatibility
- Rich text copy requires modern browsers with ClipboardItem API
- Falls back to plain text copy if API unavailable
- Tested on Chrome, Firefox, Safari, Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- Icons by [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for DesignOps professionals**
