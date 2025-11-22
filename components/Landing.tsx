
import React from 'react';
import { Button, Card } from './UI';
import { Wallet, ShieldCheck, BarChart2, Sparkles, Loader2 } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

interface LandingProps {
  // Reown handles state, so we don't need props for connection status here anymore
  // but we keep the component interface clean
}

export const Landing: React.FC<LandingProps> = () => {
  const { open } = useAppKit();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-4xl w-full z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-indigo-200">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Gemini 2.5 & Reown</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Vote on the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Future</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md mx-auto md:mx-0">
              Secure, AI-enhanced polling for the decentralized age. Connect your wallet to create polls, vote instantly, and get smart insights.
            </p>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start">
            <Button 
              onClick={() => open()} 
              className="bg-white text-indigo-900 hover:bg-indigo-50 border-0 px-8 py-4 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </Button>
            
            <p className="text-xs text-gray-400">
              Supports MetaMask, Rainbow, Coinbase, and hundreds of other wallets via Reown.
            </p>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/10 p-6 text-white hover:bg-white/15 transition-colors">
            <div className="w-10 h-10 bg-indigo-500/30 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-indigo-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Voting</h3>
            <p className="text-gray-300 text-sm">Your vote is tied to your wallet address, ensuring one person, one vote integrity.</p>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-white/10 p-6 text-white hover:bg-white/15 transition-colors">
            <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-300 text-sm">Gemini analyzes voting patterns in real-time to provide witty and deep summaries.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
