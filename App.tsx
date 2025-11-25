import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

  return (
    <BrowserRouter>
      <Routes>
        {/* Login route */}
        <Route 
          path="/" 
          element={
            isConnected && address ? (
              <Navigate to="/surveys" replace />
            ) : (
              <Login onConnect={() => open()} />
            )
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route
          path="/surveys/*"
          element={
            !isConnected || !address ? (
              <Navigate to="/" replace />
            ) : (
              <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-12 animate-fade-in">
                <Navbar />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <SurveyList />
                </main>
              </div>
            )
          }
        />
        
        {/* Redirect any other route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
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
