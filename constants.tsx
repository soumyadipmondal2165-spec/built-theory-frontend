
import { 
  FileStack, Scissors, Minimize2, FileText, Image as ImageIcon, Lock, Unlock, 
  MessageSquareQuote, Stamp, RotateCcw, FilePlus, FileSearch, LayoutTemplate,
  Trash2, FileOutput, FileSpreadsheet, Presentation, Globe, 
  Signature, Eraser, FileDiff, Zap, Sparkles, Languages, Crop, FileCode, Search, Scan,
  PenTool
} from 'lucide-react';
import { PDFTool } from './types';

export const API_URL = "https://built-theory-api.onrender.com";

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAZvTrFE81bYQ2R7JxQZnV3x6tmh_j6yL0",
    authDomain: "built-theory-auth-439a4.firebaseapp.com",
    projectId: "built-theory-auth-439a4",
    storageBucket: "built-theory-auth-439a4.firebasestorage.app",
    messagingSenderId: "621216043890",
    appId: "1:621216043890:web:242d18a5084746f68e43eb"
};

export const RAZORPAY_KEY = "rzp_live_SDvXBbpBeVUe5U";

export const TOOLS: PDFTool[] = [
  // ORGANIZE PDF
  { id: 'merge', name: 'Merge PDF', description: 'Combine PDFs in the order you want.', icon: 'FileStack', category: 'edit', color: 'bg-red-500', isPremium: false },
  { id: 'split', name: 'Split PDF', description: 'Separate pages into independent files.', icon: 'Scissors', category: 'edit', color: 'bg-orange-500', isPremium: false },
  { id: 'remove-pages', name: 'Remove pages', description: 'Delete unwanted pages from your PDF.', icon: 'Trash2', category: 'edit', color: 'bg-red-400', isPremium: true },
  { id: 'extract-pages', name: 'Extract pages', description: 'Get specific pages as new PDF files.', icon: 'FileOutput', category: 'edit', color: 'bg-orange-400', isPremium: true },
  { id: 'organize', name: 'Organize PDF', description: 'Sort, add and delete PDF pages.', icon: 'LayoutTemplate', category: 'edit', color: 'bg-violet-500', isPremium: true },
  { id: 'scan', name: 'Scan to PDF', description: 'Use your camera to create PDF docs.', icon: 'Scan', category: 'edit', color: 'bg-indigo-500', isPremium: false },

  // OPTIMIZE PDF
  { id: 'compress', name: 'Compress PDF', description: 'Reduce file size while keeping quality.', icon: 'Minimize2', category: 'optimize', color: 'bg-blue-500', isPremium: false },
  { id: 'repair', name: 'Repair PDF', description: 'Recover data from corrupted files.', icon: 'Zap', category: 'optimize', color: 'bg-yellow-600', isPremium: true },
  { id: 'ocr', name: 'OCR PDF', description: 'Make scanned PDFs searchable via AI.', icon: 'FileSearch', category: 'optimize', color: 'bg-blue-400', isPremium: true },

  // CONVERT TO PDF
  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert images to PDF documents.', icon: 'ImageIcon', category: 'convert', color: 'bg-yellow-500', isPremium: false },
  { id: 'word-to-pdf', name: 'WORD to PDF', description: 'Make DOCX files easy to read.', icon: 'FileText', category: 'convert', color: 'bg-blue-600', isPremium: false },
  { id: 'ppt-to-pdf', name: 'POWERPOINT to PDF', description: 'Convert PPTX slides to PDF.', icon: 'Presentation', category: 'convert', color: 'bg-orange-600', isPremium: false },
  { id: 'excel-to-pdf', name: 'EXCEL to PDF', description: 'Make spreadsheets readable.', icon: 'FileSpreadsheet', category: 'convert', color: 'bg-green-600', isPremium: false },
  { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert web pages to PDF docs.', icon: 'Globe', category: 'convert', color: 'bg-gray-600', isPremium: true },

  // CONVERT FROM PDF
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Extract images from your PDF.', icon: 'ImageIcon', category: 'convert', color: 'bg-yellow-400', isPremium: true },
  { id: 'pdf-to-word', name: 'PDF to WORD', description: 'Convert PDF into editable DOCX.', icon: 'FileText', category: 'convert', color: 'bg-blue-400', isPremium: true },
  { id: 'pdf-to-ppt', name: 'PDF to POWERPOINT', description: 'Convert PDF into PPTX slides.', icon: 'Presentation', category: 'convert', color: 'bg-orange-400', isPremium: true },
  { id: 'pdf-to-excel', name: 'PDF to EXCEL', description: 'Extract data to spreadsheets.', icon: 'FileSpreadsheet', category: 'convert', color: 'bg-green-400', isPremium: true },
  { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', description: 'Archive PDF for long-term storage.', icon: 'FileCode', category: 'convert', color: 'bg-gray-400', isPremium: true },

  // EDIT PDF
  { id: 'rotate', name: 'Rotate PDF', description: 'Rotate pages precisely.', icon: 'RotateCcw', category: 'edit', color: 'bg-cyan-500', isPremium: true },
  { id: 'page-numbers', name: 'Add page numbers', description: 'Add numbers to your PDF pages.', icon: 'FilePlus', category: 'edit', color: 'bg-pink-500', isPremium: true },
  { id: 'watermark', name: 'Add watermark', description: 'Stamp text or images on PDF.', icon: 'Stamp', category: 'edit', color: 'bg-red-400', isPremium: true },
  { id: 'crop', name: 'Crop PDF', description: 'Trim PDF page margins.', icon: 'Crop', category: 'edit', color: 'bg-purple-400', isPremium: true },
  { id: 'edit', name: 'Edit PDF', description: 'Add text and annotations to PDF.', icon: 'PenTool', category: 'edit', color: 'bg-pink-600', isPremium: true },

  // PDF SECURITY
  { id: 'unlock', name: 'Unlock PDF', description: 'Remove password protection.', icon: 'Unlock', category: 'optimize', color: 'bg-emerald-500', isPremium: true },
  { id: 'protect', name: 'Protect PDF', description: 'Encrypt PDF with a password.', icon: 'Lock', category: 'optimize', color: 'bg-gray-800', isPremium: true },
  { id: 'sign', name: 'Sign PDF', description: 'Add your electronic signature.', icon: 'Signature', category: 'edit', color: 'bg-pink-600', isPremium: true },
  { id: 'redact', name: 'Redact PDF', description: 'Remove sensitive information.', icon: 'Eraser', category: 'edit', color: 'bg-black', isPremium: true },
  { id: 'compare', name: 'Compare PDF', description: 'Find differences between PDFs.', icon: 'FileDiff', category: 'edit', color: 'bg-indigo-900', isPremium: true }
];

export const ICON_MAP: Record<string, any> = {
  FileStack, Scissors, Minimize2, FileText, ImageIcon, Lock, Unlock, 
  MessageSquareQuote, Stamp, RotateCcw, FilePlus, FileSearch, LayoutTemplate,
  Trash2, FileOutput, FileSpreadsheet, Presentation, Globe, 
  Signature, Eraser, FileDiff, Zap, Sparkles, Languages, Crop, FileCode, Search, Scan,
  PenTool
};
