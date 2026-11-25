import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToolCard } from './components/ToolCard';
import { TOOLS } from './data/tools';
import type { ToolCategory, ToolId, ToolDefinition } from './types/pdf';
import {
  Search,
  Sparkles,
  ArrowLeft,
  Lock,
  Zap,
  ShieldCheck,
  HelpCircle,
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Image as ImageIcon,
  Images,
  AlignLeft,
  PenTool,
  RotateCw,
  Stamp,
  Hash,
  Unlock,
} from 'lucide-react';

import { MergePdfView } from './components/tools/MergePdfView';
import { SplitPdfView } from './components/tools/SplitPdfView';
import { CompressPdfView } from './components/tools/CompressPdfView';
import { PdfToImagesView } from './components/tools/PdfToImagesView';
import { ImagesToPdfView } from './components/tools/ImagesToPdfView';
import { PdfToWordView } from './components/tools/PdfToWordView';
import { PdfToTextView } from './components/tools/PdfToTextView';
import { TextToPdfView } from './components/tools/TextToPdfView';
import { OrganizePdfView } from './components/tools/OrganizePdfView';
import { WatermarkPdfView } from './components/tools/WatermarkPdfView';
import { PageNumbersView } from './components/tools/PageNumbersView';
import { UnlockPdfView } from './components/tools/UnlockPdfView';

const iconMap: Record<string, React.ElementType> = {
  Combine,
  Scissors,
  Minimize2,
  FileText,
  Image: ImageIcon,
  Images,
  AlignLeft,
  PenTool,
  RotateCw,
  Stamp,
  Hash,
  Unlock,
};

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory =
        activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const activeTool: ToolDefinition | undefined = useMemo(() => {
    return TOOLS.find((t) => t.id === activeToolId);
  }, [activeToolId]);

  const renderToolComponent = () => {
    switch (activeToolId) {
      case 'merge-pdf':
        return <MergePdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'split-pdf':
        return <SplitPdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'compress-pdf':
        return <CompressPdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'pdf-to-images':
        return <PdfToImagesView onBackToHome={() => setActiveToolId(null)} />;
      case 'images-to-pdf':
        return <ImagesToPdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'pdf-to-word':
        return <PdfToWordView onBackToHome={() => setActiveToolId(null)} />;
      case 'pdf-to-text':
        return <PdfToTextView onBackToHome={() => setActiveToolId(null)} />;
      case 'text-to-pdf':
        return <TextToPdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'organize-pdf':
        return <OrganizePdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'watermark-pdf':
        return <WatermarkPdfView onBackToHome={() => setActiveToolId(null)} />;
      case 'page-numbers':
        return <PageNumbersView onBackToHome={() => setActiveToolId(null)} />;
      case 'unlock-pdf':
        return <UnlockPdfView onBackToHome={() => setActiveToolId(null)} />;
      default:
        return null;
    }
  };

  const ToolIcon = activeTool ? iconMap[activeTool.iconName] || FileText : FileText;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        currentCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onSelectTool={setActiveToolId}
        activeToolId={activeToolId}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* If a tool is active, render the Tool Workspace */}
        {activeToolId && activeTool ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Tool Header Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveToolId(null)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
                  title="Back to all tools"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: activeTool.color }}
                  >
                    <ToolIcon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeTool.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      {activeTool.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Local Client-Side Processing
                </span>
              </div>
            </div>

            {/* Active Tool Body */}
            <div>{renderToolComponent()}</div>
          </div>
        ) : (
          /* Homepage: Hero, Categories, Search, Grid, Features */
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Free & Unlimited PDF Suite</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Every tool you need to work with <span className="text-red-600">PDFs</span> in one place
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
                Merge, split, compress, convert, rotate, watermark, and unlock your PDF documents.
                100% private in-browser processing with zero server uploads.
              </p>

              {/* Search input */}
              <div className="pt-2 max-w-lg mx-auto relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any tool (e.g. merge, word, images, compress)..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 absolute right-4 top-3.5"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Category Filter Pills */}
            <section className="flex items-center justify-center flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Tools' },
                { id: 'organize', label: 'Organize PDF' },
                { id: 'convert-to-pdf', label: 'Convert to PDF' },
                { id: 'convert-from-pdf', label: 'Convert from PDF' },
                { id: 'security-edit', label: 'Security & Edit' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as ToolCategory)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </section>

            {/* Tools Grid */}
            <section>
              {filteredTools.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                  <p className="text-base font-bold text-slate-700">No matching tools found</p>
                  <p className="text-xs text-slate-500 mt-1">Try another keyword or search query.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onClick={() => setActiveToolId(tool.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Why Choose PDFCraft / Comparison Section */}
            <section className="mt-16 bg-gradient-to-br from-white to-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Built for Speed & Security
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Why use PDFCraft over traditional websites?
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Unlike traditional cloud converters that upload your confidential files to remote servers,
                  PDFCraft operates 100% locally on your browser.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Zero Server Storage</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Your personal files, bank statements, legal contracts, and medical forms never touch any cloud server. Everything stays on your machine.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Wait Times or Limits</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    No artificial timers, waitlists, subscription paywalls, or upload caps. Powered by modern client Web Workers and WebAssembly.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Works Completely Offline</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Once loaded, PDFCraft can execute document conversions even with no active internet connection! Perfect for airplanes and remote areas.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-3xl mx-auto space-y-6 pt-4">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Got Questions?
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
                    Are my PDF files safe and secure?
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                    Yes, absolutely! 100% of processing happens client-side inside your web browser using HTML5 Canvas, Web Workers, and JavaScript libraries (pdf-lib, pdfjs). None of your documents are ever transmitted across the internet.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
                    Is there any file size limit?
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                    Because processing happens directly on your device, there are no artificial server file limits. You can process documents as large as your device's memory can handle!
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
                    Is PDFCraft free to use?
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                    Yes! PDFCraft is completely free, open-source, and has no hidden fees, subscriptions, or watermarks placed on your converted files.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
export default App;
