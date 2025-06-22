# Resco - AI-Powered LaTeX Resume Editor

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-teal?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
</div>

<br />

**Resco** is a modern, AI-assisted LaTeX resume editor that combines the power of natural language processing with professional resume creation. Built with a Notion-inspired interface, it provides a seamless experience for creating, editing, and optimizing LaTeX resumes.

## ✨ Features

### 🤖 AI-Powered Editing

- **Natural Language Interface**: Chat with AI to describe what you want to change
- **Smart Suggestions**: Get contextual prompts for common resume improvements
- **Content Optimization**: AI-driven recommendations for better resume language

### 📝 LaTeX Support

- **Full LaTeX Support**: Upload and edit complete LaTeX resume documents
- **Live Preview**: Real-time compilation and preview of your resume
- **Template System**: Start with professional templates or upload your own

### 🔄 Version Control & Diff View

- **GitHub-Style Diffs**: Visual comparison of changes with color-coded additions, deletions, and modifications
- **Version History**: Track all changes with timestamped versions
- **Easy Rollback**: Restore previous versions with one click

### 💼 Professional Interface

- **Dual-Pane Layout**: Chat interface on the left, resume preview on the right
- **Resizable Panels**: Customize your workspace for optimal productivity
- **Modern Design**: Clean, Notion-inspired interface with dark/light mode support

### 📁 File Management

- **Drag & Drop Upload**: Intuitive file upload with progress indicators
- **File Validation**: Automatic validation for LaTeX (.tex) files
- **Multi-file Support**: Handle complex resume projects with multiple files

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd resco
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Quick Start

1. **Upload Your Resume**: Drag and drop your `.tex` file or use the upload button
2. **Start with Template**: Choose a professional template to begin from scratch
3. **Chat with AI**: Describe changes you want to make in natural language
4. **Preview Changes**: See live updates in the preview panel
5. **Export**: Download your improved resume in various formats

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React hooks for local state
- **File Processing**: Browser File API for client-side handling

### Component Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Inter font
│   ├── page.tsx            # Main application with dual-pane
│   └── globals.css         # Global styles with CSS variables
├── components/
│   ├── layout/
│   │   └── app-header.tsx  # Header with branding & controls
│   ├── chat/
│   │   └── chat-panel.tsx  # AI chat interface
│   ├── resume/
│   │   └── resume-preview.tsx # LaTeX preview & diff
│   └── ui/
│       ├── latex-file-upload.tsx # File upload component
│       └── [shadcn components]    # UI primitives
└── lib/
    └── utils.ts            # Utility functions
```

## 🎯 Current Status

### ✅ Completed (MVP)

- Modern dual-pane interface
- File upload system with validation
- AI chat interface with suggestions
- LaTeX preview with source code display
- GitHub-style diff view (mockup)
- Template system
- Responsive design

### 🔄 In Progress

- Real AI integration (GPT-4 API)
- Server-side LaTeX compilation
- PDF generation and rendering
- Real-time diff generation

### 📋 Planned Features

- Selection-based editing (click to edit sections)
- Job description optimization
- Export to PDF/DOCX/ZIP
- Overleaf and GitHub integration
- User authentication and project management
- ATS optimization scoring

## 🎨 Design Philosophy

Resco follows a **Notion-inspired design** with:

- Clean, minimal interface
- Consistent spacing and typography
- Subtle animations and micro-interactions
- Intuitive navigation and user flow
- Professional color scheme (indigo primary)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add TypeScript types for all new functionality
- Include responsive design considerations
- Test components in both light and dark modes
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **21st.dev** for modern component inspiration
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling

## 📬 Contact

For questions, suggestions, or collaboration opportunities, please open an issue or reach out to the development team.

---

<div align="center">
  <p>Built with ❤️ for the developer community</p>
  <p>Making LaTeX resume editing accessible and enjoyable</p>
</div>
