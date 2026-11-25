# PDFCraft 📄✨

> **All-in-one PDF tools & conversions, built with React, Vite, and Tailwind CSS. 100% Free, Private, and In-Browser.**

[![React](https://img.shields.io/badge/React-19.3-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=flat&logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PDFCraft** is a feature-rich, privacy-first web application inspired by iLovePDF. Unlike traditional online PDF services that upload your confidential documents to cloud servers, PDFCraft runs **100% locally in your web browser** using Web Workers, HTML5 Canvas, and modern WebAssembly.

---

## 🚀 Key Features

### 📂 Organize & Edit
- **Merge PDF**: Combine multiple PDF files in any order with drag-and-drop file management.
- **Split PDF**: Extract specific page ranges (e.g. `1-3, 5`) or split every page into separate PDFs inside a ZIP.
- **Organize & Rotate**: Visual grid of all pages to rotate (90°/180°), shift order, or delete unwanted pages.
- **Compress PDF**: Reduce file size with Extreme, Recommended, or Low compression presets.

### 🔄 Convert from PDF
- **OCR PDF (Searchable PDF)**: Convert scanned image PDFs into searchable, selectable text PDFs using in-browser WebAssembly OCR. Preserves original scanned graphics while embedding an invisible text layer.
- **PDF to Word (.docx)**: Extract structured text, headers, and paragraphs into real Microsoft Word documents.
- **PDF to JPG / PNG**: Render high-resolution (150 DPI or 300 DPI) images per page, with single or ZIP bulk downloads.
- **PDF to Text (.txt)**: Extract readable textual data with instant copy-to-clipboard, `.txt` export, and automatic OCR fallback for scanned documents.

### 📝 Convert to PDF
- **Images to PDF**: Convert JPG, PNG, and WebP images to PDF with custom margins, orientations, and page sizes.
- **Text to PDF**: Type, paste, or import plain text to generate formatted, printable PDF documents.

### 🔒 Security & Formatting
- **Watermark PDF**: Add custom text watermarks with custom opacity, rotation angle, font size, and color.
- **Page Numbers**: Insert sequential page numbering (`Page 1 of N`, `1`, etc.) at any page position.
- **Unlock PDF**: Remove password restrictions and decrypt protected PDF files.

---

## 🛡️ Why 100% Client-Side?

1. **Absolute Privacy**: Sensitive documents (tax returns, legal contracts, medical charts, financial records) **never leave your device**.
2. **Zero Upload / Download Lag**: Instant processing without waiting for files to travel over slow internet connections.
3. **No Artificial Limits**: No file size caps, queue delays, daily quotas, or subscription paywalls.
4. **Works Offline**: Once loaded, use all features without an internet connection.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Processing**:
  - [`pdf-lib`](https://pdf-lib.js.org/) for PDF generation, manipulation, merging, watermarking, and numbering
  - [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) for PDF rendering, canvas conversion, and text extraction
- **Document Exporting**:
  - [`docx`](https://docx.js.org/) for generating real Microsoft Word files
  - [`jszip`](https://stuk.github.io/jszip/) for multi-file ZIP packaging
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mydmahesh/pdf-tools.git

# Enter project directory
cd pdf-tools

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
```
The output will be placed in the `dist/` directory, ready to be hosted statically on GitHub Pages, Vercel, Netlify, or any web server.

---

## 📄 License

MIT License © 2026 [Mahesh](https://github.com/mydmahesh)

