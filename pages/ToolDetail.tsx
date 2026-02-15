
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, File as FileIcon, X, CheckCircle2, Loader2, Download, 
  RotateCw, Plus, Trash2, Check, Settings, Layers, Scissors, 
  Minimize2, Lock, Unlock, Camera, GripVertical, ArrowUp, ArrowDown, SortAsc, FileSearch,
  Crown, Info, ChevronRight, Gauge, Zap, KeyRound, ShieldAlert, ShieldCheck, Printer, Copy, Edit3,
  MousePointer2, Type, Type as TypeIcon
} from 'lucide-react';
import { TOOLS, RAZORPAY_KEY, ICON_MAP } from '../constants';
import { 
  mergePDFs, rotatePDF, imagesToPDF, organizePDF, splitPDFCustom, 
  compressPDF, watermarkPDF, unlockPDF, protectPDF 
} from '../services/pdfService';
import * as pdfjs from 'pdfjs-dist';

// Updated worker source to use a more compatible ESM-friendly link
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

export const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const activeToolId = id || 'merge';
  const tool = TOOLS.find(t => t.id === activeToolId);
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!tool) return <div className="p-20 text-center text-gray-500 font-bold">Tool not found.</div>;

  const IconComponent = ICON_MAP[tool.icon];
  const implementedTools = new Set(['merge', 'split', 'extract-pages', 'organize', 'remove-pages', 'rotate', 'compress', 'watermark', 'protect', 'unlock', 'jpg-to-pdf']);
  const isImplementedTool = implementedTools.has(activeToolId);

  // Global State
  const [user] = useState({ isPro: localStorage.getItem('bt_pro') === 'true' });
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // PDF Page Previews
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);

  // Specialized Tool State
  const [ranges, setRanges] = useState([{ from: 1, to: 1 }]);
  const [mergeRanges, setMergeRanges] = useState(false);
  const [pageOrder, setPageOrder] = useState<{index: number, rotation: number}[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [watermarkText, setWatermarkText] = useState('BUILT-THEORY');
  const [watermarkConfig, setWatermarkConfig] = useState({ size: 60, color: 'gray', alignment: 'center', opacity: 30 });
  const [compressLevel, setCompressLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [userPassword, setUserPassword] = useState('');
  const [outputName, setOutputName] = useState('BuiltTheory_Result');

  // Helper to determine accepted file types based on tool
  const getAccept = useCallback(() => {
    switch (activeToolId) {
      case 'jpg-to-pdf': return '.jpg,.jpeg'; // STRICT: Only JPG per instruction
      case 'word-to-pdf': return '.doc,.docx';
      case 'ppt-to-pdf': return '.ppt,.pptx'; // STRICT: Only PPT per instruction
      case 'excel-to-pdf': return '.xls,.xlsx'; // STRICT: Only Excel per instruction
      case 'html-to-pdf': return '.html,.htm';
      default: return 'application/pdf';
    }
  }, [activeToolId]);

  // Load PDF Thumbnails for Organization/Split tools
  const loadThumbnails = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      
      const initialOrder = Array.from({ length: pdf.numPages }, (_, i) => ({ index: i, rotation: 0 }));
      setPageOrder(initialOrder);

      const thumbs: string[] = [];
      const limit = user.isPro ? pdf.numPages : Math.min(pdf.numPages, 20);
      
      for (let i = 1; i <= limit; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        thumbs.push(canvas.toDataURL());
      }
      setThumbnails(thumbs);
    } catch (e) {
      console.error("Error loading thumbnails", e);
    }
  }, [user.isPro]);

  useEffect(() => {
    if (files.length === 1 && (activeToolId === 'split' || activeToolId === 'extract-pages' || activeToolId === 'organize' || activeToolId === 'remove-pages' || activeToolId === 'rotate')) {
      loadThumbnails(files[0]);
    }
  }, [files, activeToolId, loadThumbnails]);

  const validateFiles = (loaded: File[]) => {
    const combinedSize = [...files, ...loaded].reduce((a, b) => a + b.size, 0);
    const limit = user.isPro ? 10 * 1024 * 1024 * 1024 : 50 * 1024 * 1024;
    
    if (combinedSize > limit) {
      setError(user.isPro 
        ? "Total size exceeds the 10GB Pro limit." 
        : "Free users are limited to 50MB. Upgrade to Pro for 10GB limits!");
      return false;
    }

    const acceptStr = getAccept();
    const allowedExtensions = acceptStr.split(',').map(s => s.trim().toLowerCase());
    
    for (const file of loaded) {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      const isAllowed = allowedExtensions.some(allowed => {
        if (allowed.startsWith('.')) return allowed === extension;
        return false;
      }) || (acceptStr === 'application/pdf' && file.type === 'application/pdf');

      if (!isAllowed) {
        setError(`File "${file.name}" is not a supported format. This tool only accepts ${acceptStr}.`);
        return false;
      }
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let loaded: File[] = [];
    if ('files' in e.target && e.target.files) {
      loaded = Array.from(e.target.files);
    } else if ('dataTransfer' in e) {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        loaded = Array.from(e.dataTransfer.files);
      }
    }

    if (loaded.length === 0) return;

    if (!validateFiles(loaded)) return;

    if (activeToolId === 'merge' || activeToolId === 'jpg-to-pdf') {
      setFiles(prev => [...prev, ...loaded]);
    } else {
      setFiles(loaded.slice(0, 1));
      if (loaded[0]) setOutputName(loaded[0].name.replace(/\.[^/.]+$/, "") + '_processed');
    }
    setError(null);
  };

  const handleAction = async () => {
    if (tool.isPremium && !user.isPro) {
      setError("This tool requires a Pro subscription.");
      return;
    }

    if (!isImplementedTool) {
      setError('This tool is currently in advanced development. Please use one of the production-ready tools.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      let output: Uint8Array | null = null;
      switch (activeToolId) {
        case 'merge': 
          output = await mergePDFs(files); 
          break;
        case 'split':
          output = (await splitPDFCustom(files[0], ranges, mergeRanges))[0];
          break;
        case 'extract-pages':
          if (selectedPages.length === 0) {
            throw new Error('Select one or more pages to extract.');
          }
          output = await organizePDF(files[0], pageOrder.filter((_, i) => selectedPages.includes(i)));
          break;
        case 'organize':
        case 'remove-pages':
          output = await organizePDF(files[0], pageOrder.filter((_, i) => !selectedPages.includes(i)));
          break;
        case 'rotate':
          output = await rotatePDF(files[0], 90);
          break;
        case 'compress':
          const { data } = await compressPDF(files[0], compressLevel);
          output = data;
          break;
        case 'watermark':
          output = await watermarkPDF(files[0], watermarkText, watermarkConfig);
          break;
        case 'protect':
          output = await protectPDF(files[0], userPassword);
          break;
        case 'unlock':
          output = await unlockPDF(files[0], userPassword);
          break;
        case 'jpg-to-pdf':
          output = await imagesToPDF(files);
          break;
        default:
          throw new Error('This tool workflow is not available yet.');
      }
      
      if (output) {
        setProgress(100);
        setResult(output);
        const blob = new Blob([output], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${outputName}.pdf`;
        a.click();
      }
    } catch (err: any) {
      if (err.message === "PASSWORD_REQUIRED") {
        setError("Document is password protected. Enter password in settings.");
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const addRange = () => setRanges([...ranges, { from: 1, to: pageCount || 1 }]);
  const removeRange = (idx: number) => setRanges(ranges.filter((_, i) => i !== idx));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col md:flex-row overflow-hidden relative">
      {/* 1. Main Interaction Area */}
      <div className={`flex-grow p-4 md:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center transition-all ${files.length > 0 && !result ? 'md:mr-[400px]' : ''}`}>
        
        {/* Initial Upload State */}
        {!files.length && !result && (
          <div className="max-w-3xl w-full text-center py-20 animate-in fade-in duration-700">
             <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 shadow-sm">
                  {user.isPro ? <Crown size={12} className="text-yellow-500"/> : <Unlock size={12} className="text-green-500"/>}
                  {user.isPro ? 'Pro Member' : 'Free Mode'}
                </div>
                <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-none">{tool.name}</h1>
                <p className="text-gray-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">{tool.description}</p>
                {!isImplementedTool && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                    <Info size={14} /> Advanced engine for this tool is in progress.
                  </div>
                )}
             </div>

             <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileChange}
              className={`group border-4 border-dashed rounded-[60px] p-24 transition-all cursor-pointer shadow-xl flex flex-col items-center relative overflow-hidden ${isDragging ? 'border-red-600 bg-red-50 scale-[1.02]' : 'border-red-200 bg-white hover:border-red-600 hover:bg-red-50'}`}
             >
                <div className={`p-8 rounded-[40px] ${tool.color} text-white mb-8 group-hover:scale-110 transition-transform shadow-2xl ${isDragging ? 'scale-110' : ''}`}>
                  <Upload size={64} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                  {isDragging ? 'Drop Files Now' : `Select ${activeToolId.split('-')[0].toUpperCase()} files`}
                </h3>
                <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">or drag & drop files here</p>
                <div className="mt-4 px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border border-gray-200">
                   Allowed: <span className="text-red-600">{getAccept()}</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept={getAccept()} 
                  className="hidden" 
                  multiple={activeToolId === 'merge' || activeToolId === 'jpg-to-pdf'} 
                />
             </div>

             <div className="mt-12 flex justify-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Secure AES-256</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> 100% Client Side</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Auto-Delete Cache</div>
             </div>
          </div>
        )}

        {/* Task Active State (Files Selected) */}
        {files.length > 0 && !result && (
          <div className="w-full max-w-5xl px-4 animate-in fade-in duration-500 pb-40">
            <div className="flex justify-between items-center mb-10 border-b pb-8">
               <div>
                  <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{tool.name}</h2>
                  <p className="text-xs font-black text-gray-400 mt-2 uppercase tracking-widest">Processing {files.length} document(s)</p>
               </div>
               <div className="flex gap-4">
                 {(activeToolId === 'merge' || activeToolId === 'jpg-to-pdf') && (
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-black text-[10px] uppercase tracking-widest hover:border-red-600 transition-all shadow-sm flex items-center gap-2"
                    >
                      <Plus size={16} /> Add More
                    </button>
                 )}
                 <button onClick={() => { setFiles([]); setThumbnails([]); }} className="p-4 bg-white rounded-2xl border-2 border-gray-100 text-gray-400 hover:text-red-600 transition-all shadow-sm">
                    <Trash2 size={24} />
                 </button>
               </div>
            </div>

            {/* Grid for Organization / Split / Multi-File */}
            {(activeToolId === 'organize' || activeToolId === 'split' || activeToolId === 'extract-pages' || activeToolId === 'remove-pages' || activeToolId === 'rotate' || activeToolId === 'merge' || activeToolId === 'jpg-to-pdf') ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {/* If we have thumbnails, show pages. Else show file icons. */}
                  {thumbnails.length > 0 ? (
                    thumbnails.map((src, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (activeToolId === 'remove-pages' || activeToolId === 'organize' || activeToolId === 'extract-pages') {
                            setSelectedPages(prev => prev.includes(idx) ? prev.filter(p => p !== idx) : [...prev, idx]);
                          }
                        }}
                        className={`relative group bg-white p-3 rounded-2xl shadow-sm border-2 transition-all cursor-pointer ${selectedPages.includes(idx) ? 'border-red-600 scale-95 opacity-50' : 'border-transparent hover:border-red-200'}`}
                      >
                         <img src={src} alt={`Page ${idx+1}`} className="w-full h-auto rounded-lg shadow-inner" style={{ transform: `rotate(${pageOrder[idx]?.rotation || 0}deg)` }} />
                         <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-[8px] font-black px-2 py-1 rounded-full">{idx + 1}</div>
                         <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-900 text-[8px] font-black px-2 py-1 rounded-full uppercase">PDF Page</div>
                         {selectedPages.includes(idx) && (
                           <div className="absolute inset-0 flex items-center justify-center bg-red-600/10 rounded-2xl">
                             <Trash2 className="text-red-600" size={32} />
                           </div>
                         )}
                      </div>
                    ))
                  ) : (
                    files.map((file, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[40px] shadow-xl border-2 border-gray-50 flex flex-col items-center group relative hover:border-red-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, i) => i !== idx)); }}
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X size={16}/>
                        </button>
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${tool.color} text-white`}>
                          <FileIcon size={40} />
                        </div>
                        <h4 className="text-[10px] font-black text-gray-900 text-center truncate w-full px-2 mb-2 uppercase">{file.name}</h4>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{formatSize(file.size)}</span>
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{file.name.split('.').pop()?.toUpperCase()}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center text-gray-300 hover:bg-gray-50 hover:border-red-100 hover:text-red-300 transition-all group"
                   >
                     <Plus size={32} className="group-hover:rotate-90 transition-transform mb-2" />
                     <span className="font-black text-[10px] uppercase tracking-widest">More Files</span>
                  </button>
               </div>
            ) : (
              /* Simple File Display for Single-File Tools (Compress, Protect, etc) */
              <div className="flex justify-center">
                 <div className="bg-white p-12 rounded-[50px] shadow-2xl border-2 border-gray-50 flex flex-col items-center group relative max-w-sm w-full hover:border-red-100 transition-all">
                    <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${tool.color} text-white shadow-2xl shadow-red-100`}>
                      <FileIcon size={64} />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 text-center truncate w-full px-4 mb-3 uppercase tracking-tighter">{files[0].name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatSize(files[0].size)}</span>
                      <span className="px-3 py-1 bg-red-50 rounded-full text-[10px] font-black text-red-600 uppercase tracking-widest">{files[0].name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                 </div>
              </div>
            )}

            {isProcessing && (
              <div className="mt-20 w-full max-w-lg mx-auto bg-white p-10 rounded-[50px] shadow-2xl border border-red-50">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Processing {tool.name}...</span>
                    <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">{progress}%</span>
                 </div>
                 <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Success / Result State */}
        {result && (
          <div className="text-center py-20 animate-in zoom-in duration-500 max-w-4xl w-full px-4">
             <div className="w-40 h-40 bg-green-100 rounded-[60px] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <CheckCircle2 size={80} className="text-green-500" />
             </div>
             <h1 className="text-7xl font-black text-gray-900 mb-6 uppercase tracking-tighter leading-none">Complete!</h1>
             <p className="text-gray-500 text-2xl font-medium mb-16 max-w-2xl mx-auto leading-relaxed">Your {tool.name} task finished successfully.</p>
             
             <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
               <button 
                  onClick={() => {
                    const blob = new Blob([result], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${outputName}.pdf`; a.click();
                  }}
                  className="flex-grow py-8 bg-red-600 text-white rounded-[40px] font-black text-3xl hover:bg-red-700 shadow-[0_25px_70px_-15px_rgba(227,59,47,0.4)] flex items-center justify-center gap-6 active:scale-95 transition-all"
               >
                 <Download size={40} /> Download PDF
               </button>
               <button onClick={() => { setResult(null); setFiles([]); setProgress(0); setThumbnails([]); }} className="px-10 py-8 bg-white border-4 border-gray-100 rounded-[40px] text-gray-400 font-black text-sm uppercase tracking-[0.2em] hover:text-red-600 hover:border-red-100 transition-all">Start New →</button>
             </div>
          </div>
        )}
      </div>

      {/* 2. Tool-Specific Sidebar Settings */}
      {files.length > 0 && !result && (
        <div className="w-full md:w-[400px] bg-white border-l fixed right-0 top-0 h-screen shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-500">
           <div className="p-8 border-b bg-gray-50/50">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Configuration</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{tool.name} Options</p>
           </div>

           <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-10 pb-48">
              {/* Common Filename Input */}
              <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Output Filename</label>
                 <input 
                  type="text" 
                  value={outputName} 
                  onChange={e => setOutputName(e.target.value)}
                  className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-sm focus:border-red-500 outline-none transition-all"
                 />
              </div>

              {/* Tool-specific configuration sections... */}
              {(activeToolId === 'split' || activeToolId === 'extract-pages') && (
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Ranges</p>
                   {ranges.map((range, idx) => (
                     <div key={idx} className="flex gap-2 items-center bg-white p-4 rounded-2xl border-2 border-gray-50 shadow-sm animate-in slide-in-from-bottom-2">
                        <div className="flex-grow">
                           <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase mb-2"><span>FROM</span><span>TO</span></div>
                           <div className="flex gap-2">
                              <input type="number" value={range.from} onChange={e => {
                                const newRanges = [...ranges];
                                newRanges[idx].from = parseInt(e.target.value);
                                setRanges(newRanges);
                              }} className="w-full p-3 bg-gray-50 rounded-xl text-center font-black text-xs"/>
                              <input type="number" value={range.to} onChange={e => {
                                const newRanges = [...ranges];
                                newRanges[idx].to = parseInt(e.target.value);
                                setRanges(newRanges);
                              }} className="w-full p-3 bg-gray-50 rounded-xl text-center font-black text-xs"/>
                           </div>
                        </div>
                        <button onClick={() => removeRange(idx)} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                     </div>
                   ))}
                   <button onClick={addRange} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-red-200 hover:text-red-500 transition-all">+ Add Range</button>
                   
                   <label className="flex items-center gap-4 cursor-pointer group mt-6">
                      <div onClick={() => setMergeRanges(!mergeRanges)} className={`w-12 h-7 rounded-full p-1 transition-all ${mergeRanges ? 'bg-red-600' : 'bg-gray-200'}`}>
                         <div className={`w-5 h-5 bg-white rounded-full transition-all ${mergeRanges ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Merge all ranges into one PDF</span>
                   </label>
                </div>
              )}

              {activeToolId === 'watermark' && (
                <div className="space-y-8">
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Watermark Text</label>
                      <input 
                        type="text" 
                        value={watermarkText} 
                        onChange={e => setWatermarkText(e.target.value)}
                        className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-sm focus:border-red-500 outline-none transition-all"
                      />
                   </div>
                   <div className="p-6 bg-gray-50 rounded-[30px] border-2 border-gray-100">
                      <div className="mb-6">
                        <div className="flex justify-between mb-3"><span className="text-[9px] font-black text-gray-400 uppercase">Text Size</span><span className="text-[9px] font-black text-red-600">{watermarkConfig.size}px</span></div>
                        <input type="range" min="10" max="200" value={watermarkConfig.size} onChange={e => setWatermarkConfig({...watermarkConfig, size: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"/>
                      </div>
                      <div className="mb-6">
                        <div className="flex justify-between mb-3"><span className="text-[9px] font-black text-gray-400 uppercase">Opacity</span><span className="text-[9px] font-black text-red-600">{watermarkConfig.opacity}%</span></div>
                        <input type="range" min="0" max="100" value={watermarkConfig.opacity} onChange={e => setWatermarkConfig({...watermarkConfig, opacity: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"/>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase block mb-3">Color</span>
                        <div className="flex gap-2">
                           {['red', 'blue', 'gray', 'black'].map(c => (
                             <button key={c} onClick={() => setWatermarkConfig({...watermarkConfig, color: c})} className={`w-8 h-8 rounded-full border-2 transition-all ${watermarkConfig.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activeToolId === 'compress' && (
                <div className="space-y-4">
                   {[
                    { id: 'extreme', name: 'Extreme', desc: 'Less quality, high compression', icon: Zap },
                    { id: 'recommended', name: 'Recommended', desc: 'Good quality, good compression', icon: Check },
                    { id: 'low', name: 'Less Compression', desc: 'High quality, less compression', icon: Info }
                   ].map(level => (
                     <button 
                      key={level.id}
                      onClick={() => setCompressLevel(level.id as any)}
                      className={`w-full p-6 text-left rounded-[30px] border-4 transition-all ${compressLevel === level.id ? 'border-red-600 bg-red-50/20' : 'border-gray-50 bg-white hover:border-red-100'}`}
                     >
                        <div className="flex items-center gap-4 mb-2">
                           <level.icon className={compressLevel === level.id ? 'text-red-600' : 'text-gray-400'} size={20}/>
                           <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{level.name}</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{level.desc}</p>
                     </button>
                   ))}
                </div>
              )}

              {(activeToolId === 'protect' || activeToolId === 'unlock') && (
                <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
                   <div className="flex items-center gap-3 mb-6">
                      <KeyRound className="text-red-600" size={20}/>
                      <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">{activeToolId === 'protect' ? 'Set Encryption Key' : 'Document Password'}</span>
                   </div>
                   <input 
                    type="password" 
                    value={userPassword} 
                    onChange={e => setUserPassword(e.target.value)}
                    placeholder="Enter security password..."
                    className="w-full p-5 bg-white border-2 border-red-200 rounded-2xl font-black text-sm focus:border-red-600 outline-none transition-all"
                   />
                   <p className="text-[9px] font-bold text-red-400 uppercase mt-4 tracking-tight leading-relaxed">
                      Built-Theory uses industry standard AES-256 decryption.
                   </p>
                </div>
              )}
           </div>

           {/* Sticky Action Footer */}
           <div className="p-8 bg-white/80 backdrop-blur-md border-t absolute bottom-0 left-0 right-0 z-50">
              <button 
                onClick={handleAction}
                disabled={isProcessing || files.length === 0}
                className="w-full py-6 bg-red-600 text-white rounded-[32px] font-black text-2xl hover:bg-red-700 shadow-[0_20px_60px_-15px_rgba(227,59,47,0.4)] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={28}/> : <IconComponent size={28}/>}
                {isProcessing ? "WORKING..." : `${tool.name.toUpperCase()} →`}
              </button>
           </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-10 py-5 rounded-3xl font-black text-sm shadow-2xl animate-bounce z-[100] border-2 border-white/20 uppercase tracking-widest flex items-center gap-4">
           <ShieldAlert size={20}/> {error} <X size={18} className="cursor-pointer ml-4 opacity-50 hover:opacity-100" onClick={() => setError(null)}/>
        </div>
      )}
    </div>
  );
};
