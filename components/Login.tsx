import React from 'react';
import { Button } from './UI';
import { Vote, Sparkles } from 'lucide-react';

interface LoginProps {
  onConnect: () => void;
}

export const Login: React.FC<LoginProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center p-4 transition-colors">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl shadow-lg mb-6">
            <Vote className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Voto<span className="text-indigo-600">Genius</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Blockchain-powered surveys with AI insights
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 animate-fade-in transition-colors">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Access on-chain surveys and cast your votes securely
            </p>
          </div>

          <Button 
            onClick={onConnect}
            className="w-full py-4 text-lg"
          >
            <Vote className="w-5 h-5" />
            Connect Wallet
          </Button>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Vote className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Decentralized</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All surveys stored on-chain
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">AI Powered</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get insights from Gemini AI
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Secure</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Wallet-based authentication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
