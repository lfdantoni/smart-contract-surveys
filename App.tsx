import React from "react";
import { Login } from "./components/Login";
import { Navbar } from "./components/Navbar";
import { SurveyList } from "./components/SurveyList";
import { Web3Provider } from "./components/Web3Provider";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

const MainApp: React.FC = () => {
  // Reown / Wagmi Hooks
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  // Show Login if not connected
  if (!isConnected || !address) {
    return <Login onConnect={() => open()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 animate-fade-in">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SurveyList />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Web3Provider>
      <MainApp />
    </Web3Provider>
  );
};

export default App;
