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
  createdAt?: number;
  aiAnalysis?: string; // To store Gemini's analysis of the results
  tokenAddress?: string; // Required token contract address to vote
  tokenSymbol?: string; // Token symbol (e.g., USDC, WETH)
  tokenLogo?: string; // Token logo URL
  chainId?: number; // Chain ID where the survey contract is deployed
  isOpen?: boolean; // Whether voting is open or closed
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