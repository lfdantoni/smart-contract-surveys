import React from 'react';
import { Button } from './UI';
import { Vote, LogOut } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export const Navbar: React.FC = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
            <Vote className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Voto<span className="text-indigo-600">Genius</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => open()}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-medium text-gray-600">
              {address!.substring(0, 6)}...
              {address!.substring(address!.length - 4)}
            </span>
          </div>

          <Button
            variant="ghost"
            onClick={() => disconnect()}
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
