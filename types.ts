export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  createdAt: number;
  aiAnalysis?: string; // To store Gemini's analysis of the results
}

export enum AppView {
  LIST = 'LIST',
  CREATE = 'CREATE',
  VOTE = 'VOTE'
}

// For Gemini Response Schema
export interface AIPollSuggestion {
  question: string;
  description: string;
  options: string[];
}