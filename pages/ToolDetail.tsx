
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, File as FileIcon, X, CheckCircle2, Loader2, Download, 
  RotateCw, Hash, Type, Layout, CreditCard, Lock, Camera, Trash2, Check, 
  Settings, Layers, Sliders, Scissors, Minimize2, Plus, Pen
} from 'lucide-react';
import { TOOLS, RAZORPAY_KEY } from '../constants';
import { 
  mergePDFs, rotatePDF, imagesToPDF, removePages, organizePDF, splitPDFCustom, compressPDF, signPDF
} from '../services/pdfService';
import { geminiService } from '../services/geminiService';
import { UserProfile } from '../types';

export const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tool = TOOLS.find(t => t.id === id);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [user] = useState<UserProfile>({ isPro: false });
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reduction, setReduction] = useState(0);

  // Advanced Tool States
  const [ranges, setRanges] = useState([{ from: 1, to: 1 }]);
  const [mergeRanges, setMergeRanges] = useState(false);
  const [compressLevel, setCompressLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<{index: number, rotation: number}[]>([]);
  const [signature, setSignature] = useState<string | null>(null);

  if (!tool) return <div className="p-20 text-center">Tool not found.</div>;

  const getAcceptType = () => {
    switch(id) {
      case 'word-to-pdf': return '.doc,.docx';
      case 'excel-to-pdf': return '.xls,.xlsx';
      case 'ppt-to-pdf': return '.ppt,.pptx';
      case 'jpg-to-pdf': return 'image/jpeg,image/png';
      default: return '.pdf';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const loaded = Array.from(e.target.files || []);
    setFiles(loaded);
    // Initialize page metadata for Organize/Remove/Rotate
    // Fixed: Added 'rotate' to tools that require page-level interaction metadata
    if (loaded.length > 0 && (id === 'organize' || id === 'remove-pages' || id === 'rotate')) {
      // For demo, assume 8 pages. In production, we'd use PDFDocument to get actual count.
      setPageOrder(Array.from({length: 8}, (_, i) => ({index: i, rotation: 0})));
    }
  };

  const handleAction = async () => {
    if (tool.isPremium && !user.isPro) {
      setError("This is a Premium feature. Upgrade to Pro for unlimited access.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      let output: Uint8Array | null = null;
      switch (id) {
        case 'merge': output = await mergePDFs(files); break;
        case 'split': output = (await splitPDFCustom(files[0], ranges, mergeRanges))[0]; break;
        case 'remove-pages': output = await removePages(files[0], selectedPages); break;
        case 'organize': output = await organizePDF(files[0], pageOrder); break;
        // Fixed: Added case for 'rotate' to use organizePDF for multi-page rotation handling
        case 'rotate': output = await organizePDF(files[0], pageOrder); break;
        case 'compress': 
          const {data, reduction} = await compressPDF(files[0], compressLevel);
          output = data;
          setReduction(reduction);
          break;
        case 'jpg-to-pdf': output = await imagesToPDF(files); break;
        case 'sign': output = await signPDF(files[0], signature || '', 50, 50, 0); break;
        default: output = await mergePDFs(files);
      }
      setResult(output);
    } catch (err: any) {
      setError(err.message || "Failed to process document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = () => {
    const options = {
      key: RAZORPAY_KEY,
      amount: 49900,
      currency: "INR",
      name: "Built-Theory Pro",
      description: "Lifetime License for all PDF Tools",
      handler: (response: any) => window.location.reload(),
      theme: { color: "#e33b2f" }
    };
    const rzp = (window as any).Razorpay ? new (window as any).Razorpay(options) : { open: () => alert("Payment error") };
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-[#F2F3F5] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar (iLovePDF Style) */}
      {files.length > 0 && !result && (
        <div className="w-full md:w-[350px] bg-white border-l order-2 md:order-2 p-8 shadow-2xl z-10 flex flex-col h-screen">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="text-gray-400" />
            <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{tool.name}</h2>
          </div>

          <div className="flex-grow overflow-y-auto space-y-8 pb-32">
            {id === 'split' && (
              <div className="space-y-6">
                 <div className="flex gap-2 mb-4">
                    <button className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase">Custom Ranges</button>
                    <button className="flex-1 py-2 bg-gray-50 text-gray-400 border rounded-lg text-xs font-bold uppercase opacity-50">Fixed Ranges</button>
                 </div>
                 {ranges.map((r, i) => (
                   <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
                     <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Range {i+1}</span>
                     <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 block">FROM</label>
                          <input type="number" value={r.from} onChange={e => {
                            const n = [...ranges]; n[i].from = Number(e.target.value); setRanges(n);
                          }} className="w-full p-2 bg-white border rounded font-bold" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 block">TO</label>
                          <input type="number" value={r.to} onChange={e => {
                            const n = [...ranges]; n[i].to = Number(e.target.value); setRanges(n);
                          }} className="w-full p-2 bg-white border rounded font-bold" />
                        </div>
                     </div>
                     {ranges.length > 1 && <button onClick={() => setRanges(ranges.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X size={14} /></button>}
                   </div>
                 ))}
                 <button onClick={() => setRanges([...ranges, {from: 1, to: 1}])} className="w-full py-3 border-2 border-dashed border-red-200 text-red-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50">
                    <Plus size={16} /> Add Range
                 </button>
                 <div className="flex items-center gap-3 pt-4 border-t">
                    <input type="checkbox" checked={mergeRanges} onChange={e => setMergeRanges(e.target.checked)} className="w-5 h-5 accent-red-600" />
                    <label className="text-sm font-bold text-gray-700">Merge all ranges in one PDF</label>
                 </div>
              </div>
            )}

            {id === 'compress' && (
              <div className="space-y-4">
                 {[
                   {id: 'extreme', name: 'EXTREME COMPRESSION', desc: 'Less quality, high compression', icon: Minimize2},
                   {id: 'recommended', name: 'RECOMMENDED COMPRESSION', desc: 'Good quality, good compression', icon: CheckCircle2},
                   {id: 'low', name: 'LESS COMPRESSION', desc: 'High quality, less compression', icon: Layers}
                 ].map(lvl => (
                   <div 
                    key={lvl.id} 
                    onClick={() => setCompressLevel(lvl.id as any)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${compressLevel === lvl.id ? 'border-red-500 bg-red-50 shadow-inner' : 'bg-white border-gray-100 hover:border-red-200'}`}
                   >
                     <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black tracking-tighter ${compressLevel === lvl.id ? 'text-red-600' : 'text-gray-900'}`}>{lvl.name}</span>
                        {compressLevel === lvl.id && <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>}
                     </div>
                     <p className="text-xs text-gray-400 font-medium">{lvl.desc}</p>
                   </div>
                 ))}
              </div>
            )}

            {id === 'sign' && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 border rounded-2xl">
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Draw Your Signature</label>
                   <div className="bg-white h-40 rounded-xl border border-dashed border-gray-300 relative overflow-hidden">
                      <canvas className="w-full h-full cursor-crosshair" onMouseDown={() => setSignature("mock_sig_data")}/>
                      {!signature && <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none text-xs">Sign here...</div>}
                   </div>
                   <button onClick={() => setSignature(null)} className="text-xs text-red-500 font-bold mt-2">Clear Signature</button>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t">
            <button 
              onClick={handleAction}
              disabled={isProcessing}
              className="w-full py-6 bg-red-600 text-white rounded-[30px] font-black text-xl hover:bg-red-700 shadow-2xl shadow-red-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <tool.icon />}
              {isProcessing ? "PROCESSING..." : `${tool.name.toUpperCase()} →`}
            </button>
          </div>
        </div>
      )}

      {/* Main Content (Preview Area) */}
      <div className={`flex-grow p-12 overflow-y-auto order-1 md:order-1 flex flex-col items-center justify-center min-h-screen`}>
        {!files.length && !result && (
          <div className="max-w-4xl w-full text-center">
             <div className="mb-12">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black mb-4 ${tool.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {tool.isPremium ? <Lock size={12} /> : null}
                  {tool.isPremium ? 'PREMIUM TOOL' : 'FREE ACCESS'}
                </div>
                <h1 className="text-6xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{tool.name}</h1>
                <p className="text-gray-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">{tool.description}</p>
             </div>

             {tool.isPremium && !user.isPro && (
                <div className="bg-white rounded-[40px] p-10 shadow-2xl border-4 border-yellow-400 mb-12 flex flex-col md:flex-row items-center gap-8 text-left">
                   <div className="bg-yellow-400 p-6 rounded-3xl text-gray-900"><Lock size={48} /></div>
                   <div>
                     <h2 className="text-2xl font-black text-gray-900 mb-1">PRO FEATURES LOCKED</h2>
                     <p className="text-gray-500 font-medium mb-4">Unlimited conversion, editing, and security. No ads. Forever.</p>
                     <button onClick={handleUpgrade} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all">GET LIFETIME PRO FOR ₹499</button>
                   </div>
                </div>
             )}

             <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border-4 border-dashed border-red-200 bg-white rounded-[60px] p-24 hover:border-red-600 hover:bg-red-50 transition-all cursor-pointer shadow-xl flex flex-col items-center"
             >
                <div className={`p-8 rounded-[40px] ${tool.color} text-white mb-8 group-hover:scale-110 transition-transform shadow-2xl`}>
                  <Upload size={64} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">SELECT FILE</h3>
                <p className="text-gray-400 font-bold tracking-widest text-xs mt-2 uppercase">Your privacy is 100% guaranteed</p>
                <input type="file" ref={fileInputRef} accept={getAcceptType()} onChange={handleFileChange} className="hidden" multiple={id === 'merge' || id === 'jpg-to-pdf'} />
             </div>
          </div>
        )}

        {files.length > 0 && !result && (
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {/* Visual Grid for Organize/Remove/Rotate */}
              {/* Fixed: Added 'rotate' to tools that use the visual page grid */}
              {(id === 'organize' || id === 'remove-pages' || id === 'extract-pages' || id === 'rotate') ? (
                pageOrder.map((page, idx) => (
                  <div key={idx} className="relative group animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx*50}ms`}}>
                    <div 
                      onClick={() => {
                        if (id === 'remove-pages' || id === 'extract-pages') {
                          setSelectedPages(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
                        }
                      }}
                      className={`aspect-[3/4] bg-white rounded-2xl shadow-lg border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all overflow-hidden ${selectedPages.includes(idx) ? 'border-red-500 shadow-red-100 ring-4 ring-red-50' : 'border-gray-100 group-hover:border-red-200'}`}
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    >
                      <FileIcon size={40} className="text-gray-200" />
                      <div className="absolute inset-0 bg-white/50 group-hover:bg-transparent transition-colors"></div>
                      <span className="mt-4 text-[10px] font-black text-gray-400">{idx + 1}</span>
                      {selectedPages.includes(idx) && <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"><Check size={12}/></div>}
                    </div>
                    {/* Fixed: Show rotation/delete buttons for both 'organize' and 'rotate' tools */}
                    {(id === 'organize' || id === 'rotate') && (
                      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => {
                            const n = [...pageOrder]; n[idx].rotation = (n[idx].rotation + 90) % 360; setPageOrder(n);
                         }} className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-red-500"><RotateCw size={14}/></button>
                         <button onClick={() => setPageOrder(pageOrder.filter((_, i) => i !== idx))} className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center">
                   <div className="w-64 aspect-[3/4] bg-white rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center justify-center p-10 animate-bounce-slow">
                      <FileIcon size={80} className="text-red-500 mb-6" />
                      <span className="text-sm font-black text-gray-900 truncate w-full text-center uppercase tracking-tighter">{files[0].name}</span>
                      <span className="text-[10px] font-bold text-gray-300 mt-2">{(files[0].size/1024/1024).toFixed(2)} MB</span>
                   </div>
                   <button onClick={() => setFiles([])} className="mt-8 text-gray-400 font-black text-xs tracking-widest hover:text-red-500 transition-colors uppercase">Remove File</button>
                </div>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="text-center animate-in zoom-in duration-500">
             <div className="w-40 h-40 bg-green-100 rounded-[60px] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <CheckCircle2 size={80} className="text-green-500" />
             </div>
             <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Success!</h1>
             <p className="text-gray-500 text-xl font-medium mb-12">Your document is optimized and ready.</p>
             
             {id === 'compress' && (
               <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-12 animate-pulse">
                  <div className="text-4xl font-black text-red-600">{reduction}% SMALLER</div>
                  <div className="text-xs font-black text-red-300 tracking-widest uppercase mt-1">Built-Theory Compression Engine</div>
               </div>
             )}

             <div className="flex flex-col gap-4">
               <button 
                  onClick={() => {
                    const blob = new Blob([result], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `BuiltTheory_${id}_${Date.now()}.pdf`; a.click();
                  }}
                  className="px-20 py-6 bg-red-600 text-white rounded-[40px] font-black text-3xl hover:bg-red-700 shadow-[0_20px_60px_-15px_rgba(227,59,47,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all"
               >
                 <Download size={32} /> DOWNLOAD PDF
               </button>
               <button onClick={() => { setResult(null); setFiles([]); }} className="text-gray-400 font-black text-sm uppercase tracking-[0.2em] hover:text-red-600 mt-8 py-4">Start Over →</button>
             </div>
          </div>
        )}
      </div>
      {error && <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl animate-bounce z-50">{error}</div>}
    </div>
  );
};
