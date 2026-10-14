import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Star,
  ExternalLink,
  Plus,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Code2,
  ShieldCheck,
  Info
} from 'lucide-react';
import { BrowserTab, Order } from '../types';
import { generateAiStudioPrompt } from '../utils/formatters';

interface ChromeBrowserProps {
  orders: Order[];
  selectedOrderForPrompt?: Order | null;
  onSelectOrderForPrompt?: (order: Order | null) => void;
}

const DEFAULT_URL = 'https://aistudio.google.com/apps';

export const ChromeBrowser: React.FC<ChromeBrowserProps> = ({
  orders,
  selectedOrderForPrompt,
  onSelectOrderForPrompt
}) => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Google AI Studio — Apps',
      url: DEFAULT_URL,
      favicon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f2942da0.svg',
    },
    {
      id: 'tab-2',
      title: 'Gemini Chat',
      url: 'https://gemini.google.com',
      favicon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f2942da0.svg',
    }
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputUrl, setInputUrl] = useState<string>(DEFAULT_URL);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);
  const [showPromptDrawer, setShowPromptDrawer] = useState<boolean>(true);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    selectedOrderForPrompt?.id || (orders.length > 0 ? orders[0].id : '')
  );

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeOrder = orders.find((o) => o.id === selectedOrderId);

  const handleSelectTab = (tab: BrowserTab) => {
    setActiveTabId(tab.id);
    setInputUrl(tab.url);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Keep at least one tab
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
      setInputUrl(newTabs[0].url);
    }
  };

  const handleAddTab = (url = DEFAULT_URL, title = 'Google AI Studio') => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: title,
      url: url,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setInputUrl(url);
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setTabs(
      tabs.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url,
              title: url.includes('aistudio.google.com')
                ? 'Google AI Studio'
                : url.replace(/^https?:\/\//, '').split('/')[0] || 'Web Browser',
            }
          : t
      )
    );
    setInputUrl(url);
    setIframeKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleGoHome = () => {
    setInputUrl(DEFAULT_URL);
    setTabs(
      tabs.map((t) =>
        t.id === activeTabId
          ? { ...t, url: DEFAULT_URL, title: 'Google AI Studio — Apps' }
          : t
      )
    );
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(activeTab.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    window.open(activeTab.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPrompt = () => {
    if (!activeOrder) return;
    const prompt = generateAiStudioPrompt(activeOrder);
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const quickBookmarks = [
    { name: 'AI Studio Apps', url: 'https://aistudio.google.com/apps', icon: '✨' },
    { name: 'Gemini Chat', url: 'https://gemini.google.com', icon: '🤖' },
    { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { name: 'Vercel', url: 'https://vercel.com', icon: '▲' },
    { name: 'Tailwind Docs', url: 'https://tailwindcss.com/docs', icon: '🎨' },
    { name: 'Google Cloud', url: 'https://console.cloud.google.com', icon: '☁️' }
  ];

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isMaximized ? 'fixed inset-3 z-50 rounded-xl' : 'h-[820px] w-full'
      }`}
    >
      {/* Chrome Window Title Bar & Tabs */}
      <div className="bg-slate-950 px-3 pt-2.5 pb-0 flex items-center justify-between border-b border-slate-800 select-none">
        {/* Left: Window control dots + Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar max-w-[85%]">
          {/* Mac/Chrome Window Dots */}
          <div className="flex items-center space-x-1.5 pr-2 pl-1">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors inline-block cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors inline-block cursor-pointer" />
            <span
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors inline-block cursor-pointer"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleSelectTab(tab)}
                  className={`group relative flex items-center h-9 px-3.5 max-w-[210px] text-xs font-medium rounded-t-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 shadow-sm border-t-2 border-sky-400'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-4">
                    <span className="text-sm">
                      {tab.url.includes('aistudio.google.com') ? '✨' : '🌐'}
                    </span>
                    <span className="truncate">{tab.title}</span>
                  </div>

                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      className={`absolute right-1.5 p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Tutup tab"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Tab Button */}
            <button
              onClick={() => handleAddTab()}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Buka tab baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Chrome Controls */}
        <div className="flex items-center space-x-1.5 pb-1 text-slate-400">
          <button
            onClick={() => setShowPromptDrawer(!showPromptDrawer)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              showPromptDrawer
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Buka/Tutup Asisten Prompt AI Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Studio Prompt</span>
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
            title={isMaximized ? 'Perkecil jendela' : 'Perbesar penuh'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chrome Navigation Toolbar & Address Bar */}
      <div className="bg-slate-800 px-3 py-2 flex items-center space-x-2 border-b border-slate-700/80">
        {/* Nav Controls */}
        <div className="flex items-center space-x-1 text-slate-300">
          <button
            onClick={handleGoHome}
            className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-200"
            title="Kembali ke AI Studio (Home)"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 text-slate-600 cursor-not-allowed rounded-md"
            title="Kembali (Mundur)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 text-slate-600 cursor-not-allowed rounded-md"
            title="Maju"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-200"
            title="Muat Ulang Halaman (Reload)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox / URL Bar */}
        <form onSubmit={handleNavigate} className="flex-1 relative flex items-center">
          <div className="w-full flex items-center bg-slate-900 border border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
            <div className="flex items-center space-x-1 text-emerald-400 pr-2 select-none" title="Koneksi Aman (HTTPS)">
              <Lock className="w-3.5 h-3.5" />
            </div>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Ketik URL (misal https://aistudio.google.com/apps)..."
              className="w-full bg-transparent outline-none font-mono text-xs text-slate-200 placeholder-slate-500"
            />

            <div className="flex items-center space-x-1 pl-2 text-slate-400">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Salin URL"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                className="p-1 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                title="Bookmark halaman ini"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </button>
            </div>
          </div>
        </form>

        {/* Viewport & External Launch Buttons */}
        <div className="flex items-center space-x-1 pl-1">
          {/* Viewport switchers */}
          <div className="hidden md:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewportMode === 'desktop'
                  ? 'bg-slate-700 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ukuran Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewportMode === 'tablet'
                  ? 'bg-slate-700 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ukuran Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewportMode === 'mobile'
                  ? 'bg-slate-700 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ukuran Mobile (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Open In Real External Chrome Window */}
          <button
            onClick={handleOpenExternal}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors"
            title="Buka langsung di tab baru Google Chrome browser asli kamu"
          >
            <span>Buka di Tab Asli</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="bg-slate-850 px-3 py-1.5 flex items-center space-x-2 border-b border-slate-800 text-xs overflow-x-auto no-scrollbar">
        <span className="text-slate-500 text-[11px] font-medium pr-1 flex items-center">
          Bookmarks:
        </span>
        {quickBookmarks.map((bm) => (
          <button
            key={bm.name}
            onClick={() => {
              setInputUrl(bm.url);
              setTabs(
                tabs.map((t) =>
                  t.id === activeTabId ? { ...t, url: bm.url, title: bm.name } : t
                )
              );
              setIframeKey((prev) => prev + 1);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-800/80 transition-colors whitespace-nowrap"
          >
            <span>{bm.icon}</span>
            <span>{bm.name}</span>
          </button>
        ))}
      </div>

      {/* Main Browser Viewport & Sidebar */}
      <div className="flex-1 flex overflow-hidden bg-slate-950 relative">
        {/* Main Content Area / Iframe Container */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-auto p-2 bg-slate-950">
          {/* Info Banner for Google AI Studio Embed */}
          <div className="w-full max-w-5xl mb-2 bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-slate-900 border border-sky-800/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-200">
            <div className="flex items-start space-x-2.5">
              <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  Workspace Google AI Studio Apps Terhubung
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Gunakan browser di bawah untuk mengakses <span className="text-sky-300 font-mono">https://aistudio.google.com/apps</span>. Jika browser memblokir tampilan frame Google karena aturan privasi Google, klik tombol <strong className="text-sky-300">"Buka di Tab Asli"</strong> di atas untuk langsung mulai coding di AI Studio.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleOpenExternal}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <span>Buka AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Browser Iframe with dynamic viewport width */}
          <div
            className={`h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700/80 transition-all duration-300 relative flex flex-col ${
              viewportMode === 'mobile'
                ? 'w-[390px] h-[780px] max-h-full my-auto'
                : viewportMode === 'tablet'
                ? 'w-[768px] h-[900px] max-h-full my-auto'
                : 'w-full flex-1'
            }`}
          >
            <iframe
              key={iframeKey}
              src={activeTab.url}
              title={activeTab.title}
              className="w-full h-full border-0 bg-white"
              allow="accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* AI Studio Prompt Assistant Drawer (Right side) */}
        {showPromptDrawer && (
          <div className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    AI Studio Prompt Builder
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Otomatisasi spek pesanan ke prompt
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Order */}
            <div className="p-3.5 border-b border-slate-800 space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Pilih Pesanan Klien:</span>
                <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800">
                  {orders.length} Pesanan
                </span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord && onSelectOrderForPrompt) {
                    onSelectOrderForPrompt(ord);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.appName} — {o.clientName}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt preview & actions */}
            <div className="flex-1 p-3.5 flex flex-col space-y-3 overflow-y-auto">
              {activeOrder ? (
                <>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Klien: <strong className="text-slate-200">{activeOrder.clientName}</strong></span>
                      <span className="text-amber-400">{activeOrder.projectType}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 border-t border-slate-850 pt-2 flex items-center justify-between">
                      <span>Akun Admin:</span>
                      <span className="font-mono text-emerald-400">{activeOrder.credential.email}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-medium flex items-center space-x-1">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Prompt Siap Copy untuk AI Studio:</span>
                      </span>
                    </div>
                    <textarea
                      readOnly
                      value={generateAiStudioPrompt(activeOrder)}
                      className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 resize-none focus:outline-none leading-relaxed focus:border-indigo-500/60 selection:bg-indigo-600/40"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleCopyPrompt}
                      className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md ${
                        promptCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {promptCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Berhasil Disalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Prompt AI Studio Ini</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleOpenExternal}
                      className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>Buka https://aistudio.google.com/apps</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs">
                  <Info className="w-8 h-8 mb-2 opacity-50" />
                  <p>Belum ada data pesanan yang dipilih.</p>
                </div>
              )}
            </div>

            {/* Tips footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400">
              💡 <strong>Tips:</strong> Salin prompt di atas, buka AI Studio Apps, lalu paste untuk langsung menghasilkan aplikasi sesuai pesanan klien!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
