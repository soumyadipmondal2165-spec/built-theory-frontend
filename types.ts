
export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'edit' | 'convert' | 'optimize' | 'ai';
  color: string;
  isPremium?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserProfile {
  isPro: boolean;
  email?: string;
  uid?: string;
}
