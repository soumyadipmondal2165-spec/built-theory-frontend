
import { 
  FileStack, Scissors, Minimize2, FileText, Image as ImageIcon, Lock, Unlock, 
  MessageSquareQuote, Stamp, RotateCcw, FilePlus, FileSearch, LayoutTemplate,
  Trash2, FileOutput, FileSpreadsheet, Presentation, Globe, 
  Signature, Eraser, FileDiff, Zap, Sparkles, Languages, Crop, FileCode, Search, Scan,
  PenTool
} from 'lucide-react';
import { PDFTool } from './types';

export const RAZORPAY_KEY = "rzp_live_SDvXBbpBeVUe5U";

export const PRICING = {
  weekly: 59,
  monthly: 199,
  yearly: 1999
};

export const TOOLS: PDFTool[] = [
  // CATEGORY: EDIT
  { id: 'merge', name: 'Merge PDF', description: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: 'FileStack', category: 'edit', color: 'bg-red-500', isPremium: false },
  { id: 'split', name: 'Split PDF', description: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: 'Scissors', category: 'edit', color: 'bg-orange-500', isPremium: false },
  { id: 'remove-pages', name: 'Remove pages', description: 'Delete unwanted pages from your PDF file in just a few clicks.', icon: 'Trash2', category: 'edit', color: 'bg-red-400', isPremium: false },
  { id: 'extract-pages', name: 'Extract pages', description: 'Get specific pages as a new PDF file with high precision.', icon: 'FileOutput', category: 'edit', color: 'bg-orange-400', isPremium: false },
  { id: 'organize', name: 'Organize PDF', description: 'Sort, add and delete PDF pages. Rotate pages and reorder them easily.', icon: 'LayoutTemplate', category: 'edit', color: 'bg-violet-500', isPremium: false },
  { id: 'rotate', name: 'Rotate PDF', description: 'Rotate your PDFs the way you need them. Even rotate multiple PDFs at once!', icon: 'RotateCcw', category: 'edit', color: 'bg-cyan-500', isPremium: false },
  { id: 'watermark', name: 'Add watermark', description: 'Stamp an image or text over your PDF in seconds. Choose typography, transparency and position.', icon: 'Stamp', category: 'edit', color: 'bg-red-400', isPremium: false },
  { id: 'page-numbers', name: 'Add page numbers', description: 'Add page numbers into PDFs with ease. Choose your typography, size and position.', icon: 'FilePlus', category: 'edit', color: 'bg-pink-500', isPremium: true },
  { id: 'crop', name: 'Crop PDF', description: 'Trim PDF page margins or specific areas with a smart visual tool.', icon: 'Crop', category: 'edit', color: 'bg-purple-400', isPremium: true },
  { id: 'edit', name: 'Edit PDF', description: 'Add text, images, shapes or freehand annotations to a PDF document.', icon: 'PenTool', category: 'edit', color: 'bg-pink-600', isPremium: true },

  // CATEGORY: CONVERT
  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPG, PNG, BMP, GIF and TIFF images to PDF in seconds.', icon: 'ImageIcon', category: 'convert', color: 'bg-yellow-500', isPremium: false },
  { id: 'word-to-pdf', name: 'WORD to PDF', description: 'Make DOC and DOCX files easy to read by converting them to PDF.', icon: 'FileText', category: 'convert', color: 'bg-blue-600', isPremium: false },
  { id: 'ppt-to-pdf', name: 'POWERPOINT to PDF', description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', icon: 'Presentation', category: 'convert', color: 'bg-orange-600', isPremium: false },
  { id: 'excel-to-pdf', name: 'EXCEL to PDF', description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', icon: 'FileSpreadsheet', category: 'convert', color: 'bg-green-600', isPremium: false },
  { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert web pages in HTML to PDF with high fidelity.', icon: 'Globe', category: 'convert', color: 'bg-gray-600', isPremium: false },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Extract all images from a PDF or convert each page to a JPG image.', icon: 'ImageIcon', category: 'convert', color: 'bg-yellow-400', isPremium: true },
  { id: 'pdf-to-word', name: 'PDF to WORD', description: 'Convert your PDF to WORD documents with incredible accuracy.', icon: 'FileText', category: 'convert', color: 'bg-blue-400', isPremium: true },
  { id: 'pdf-to-ppt', name: 'PDF to POWERPOINT', description: 'Convert your PDFs to POWERPOINT presentations.', icon: 'Presentation', category: 'convert', color: 'bg-orange-400', isPremium: true },
  { id: 'pdf-to-excel', name: 'PDF to EXCEL', description: 'Extract data directly from PDF into EXCEL spreadsheets.', icon: 'FileSpreadsheet', category: 'convert', color: 'bg-green-400', isPremium: true },
  { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', description: 'Convert PDF to PDF/A for long-term archiving and compliance.', icon: 'FileCode', category: 'convert', color: 'bg-gray-400', isPremium: true },

  // CATEGORY: OPTIMIZE
  { id: 'compress', name: 'Compress PDF', description: 'Reduce file size while optimizing for maximal PDF quality.', icon: 'Minimize2', category: 'optimize', color: 'bg-blue-500', isPremium: false },
  { id: 'ocr', name: 'OCR PDF', description: 'Convert any scanned PDF into a searchable and selectable document.', icon: 'FileSearch', category: 'optimize', color: 'bg-blue-400', isPremium: false },
  { id: 'repair', name: 'Repair PDF', description: 'Repair a damaged PDF and recover data from corrupt files.', icon: 'Zap', category: 'optimize', color: 'bg-yellow-600', isPremium: true },
  { id: 'unlock', name: 'Unlock PDF', description: 'Remove PDF password security, giving you freedom to use your PDF.', icon: 'Unlock', category: 'optimize', color: 'bg-emerald-500', isPremium: true },
  { id: 'protect', name: 'Protect PDF', description: 'Protect PDF files with a password. Encrypt PDF to prevent unauthorized access.', icon: 'Lock', category: 'optimize', color: 'bg-gray-800', isPremium: true },
  { id: 'sign', name: 'Sign PDF', description: 'Sign a document and request signatures. E-sign your PDF in seconds.', icon: 'Signature', category: 'edit', color: 'bg-gray-700', isPremium: true },
  { id: 'scan', name: 'Scan to PDF', description: 'Scan your paper documents to PDF on the go using your mobile device.', icon: 'Scan', category: 'edit', color: 'bg-indigo-500', isPremium: false }
];

export const ICON_MAP: Record<string, any> = {
  FileStack, Scissors, Minimize2, FileText, ImageIcon, Lock, Unlock, 
  MessageSquareQuote, Stamp, RotateCcw, FilePlus, FileSearch, LayoutTemplate,
  Trash2, FileOutput, FileSpreadsheet, Presentation, Globe, 
  Signature, Eraser, FileDiff, Zap, Sparkles, Languages, Crop, FileCode, Search, Scan,
  PenTool
};
