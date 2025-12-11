<div align="center">


---

## ✨ Features

### 🤖 AI-Powered Development
- **Natural Language Coding**: Describe what you want to build, and let AI generate complete applications
- **Multi-File Generation**: Create entire project structures with a single prompt
- **Context-Aware**: AI understands your existing code and makes intelligent suggestions
- **Smart Code Editing**: AI can modify existing files while preserving your work

### 💻 Premium Code Editor
- **Fully Editable**: Manual code editing with Monaco Editor (VSCode's editor)
- **Syntax Highlighting**: Support for TypeScript, JavaScript, Python, HTML, CSS, and more
- **Auto-Save**: Changes are automatically saved to IndexedDB
- **IntelliSense**: Code completion and suggestions
- **Multiple File Support**: Work with multiple files seamlessly

### 🎨 Live Preview
- **Instant Preview**: See your React components and HTML in real-time
- **Error Display**: Runtime errors shown in the preview
- **Responsive Testing** (Coming Soon): Test different viewport sizes

### 📦 Project Management
- **Multiple Projects**: Create and manage unlimited projects
- **IndexedDB Storage**: Fast, reliable local storage with automatic migration from localStorage
- **Export/Import**: Backup and share your projects
- **Project Search**: Quickly find your projects
- **One-Click Delete**: Remove projects with confirmation

### 🎯 Modern UX/UI
- **Glassmorphic Design**: Premium dark theme with blur effects
- **Smooth Animations**: Delightful micro-interactions
- **Responsive**: Works on desktop, tablet, and mobile
- **Loading States**: Beautiful skeleton loaders and spinners

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/YOUR_USERNAME/genai-code-agent.git
   cd genai-code-agent
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 🎉

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy:
```bash
vercel
```

---

## 📖 How to Use

1. **Create a Project**: Click "Start Coding" or "Create New Project"
2. **Chat with AI**: Describe what you want to build in natural language
3. **Review & Edit**: AI generates code that you can review and manually edit
4. **Preview**: See your changes in real-time in the preview panel
5. **Export**: Download your project as needed

### Example Prompts

- "Create a todo app with React and Tailwind CSS"
- "Build a landing page for a SaaS product"
- "Make a calculator with dark mode"
- "Create a Python data visualization script"

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini 2.5 Flash
- **Editor**: Monaco Editor (VSCode)
- **Storage**: IndexedDB with fallback to localStorage
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 🧩 Project Structure

```
genai-code-agent/
├── components/          # React components
│   ├── AgentWorkspace.tsx    # Main workspace
│   ├── CodeEditor.tsx        # Monaco editor wrapper
│   ├── Preview.tsx           # Live preview
│   ├── SplashScreen.tsx      # Home screen
│   └── ...
├── services/           # Business logic
│   ├── geminiService.ts      # AI integration
│   └── storageService.ts     # IndexedDB operations
├── utils/              # Helper functions
├── types.ts            # TypeScript types
├── App.tsx             # Root component
├── index.css           # Global styles
└── vite.config.ts      # Build configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini for the powerful AI model
- Monaco Editor team for the excellent code editor
- Tailwind CSS for the utility-first CSS framework
- The React team for the amazing framework

---

## 📧 Contact

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Issues: [Report a bug](https://github.com/YOUR_USERNAME/genai-code-agent/issues)

---

<div align="center">

**Made with ❤️ and AI**

[⬆ Back to Top](#-genai-code-agent)

</div>
