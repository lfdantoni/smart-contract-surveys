
import React, { useState } from 'react';
import { Poll, AppView } from './types';
import { CreatePollModal } from './components/CreatePollModal';
import { PollView } from './components/PollView';
import { Button, Card } from './components/UI';
import { Landing } from './components/Landing';
import { Plus, Vote, BarChart3, Search, LogOut } from 'lucide-react';
import { Web3Provider } from './components/Web3Provider';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

// Mock Initial Data
const INITIAL_POLLS: Poll[] = [
  {
    id: '1',
    question: 'What is the best frontend framework?',
    description: 'Help us decide the tech stack for the next project.',
    createdAt: Date.now(),
    options: [
      { id: 'opt1', text: 'React', votes: 42 },
      { id: 'opt2', text: 'Vue', votes: 28 },
      { id: 'opt3', text: 'Svelte', votes: 15 },
      { id: 'opt4', text: 'Angular', votes: 10 },
    ]
  },
  {
    id: '2',
    question: 'Preferred remote work schedule?',
    createdAt: Date.now() - 100000,
    options: [
      { id: 'opt_a', text: 'Fully Remote', votes: 120 },
      { id: 'opt_b', text: 'Hybrid (3/2)', votes: 85 },
      { id: 'opt_c', text: 'In Office', votes: 12 },
    ]
  }
];

const MainApp: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LIST);
  const [activePollId, setActivePollId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reown / Wagmi Hooks
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  // Find active poll object
  const activePoll = polls.find(p => p.id === activePollId);

  const handleCreatePoll = (question: string, description: string, optionTexts: string[]) => {
    const newPoll: Poll = {
      id: Date.now().toString(),
      question,
      description,
      createdAt: Date.now(),
      options: optionTexts.map((text, index) => ({
        id: `opt_${Date.now()}_${index}`,
        text,
        votes: 0
      }))
    };
    setPolls([newPoll, ...polls]);
    setShowCreateModal(false);
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prevPolls => prevPolls.map(poll => {
      if (poll.id !== pollId) return poll;
      return {
        ...poll,
        options: poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        )
      };
    }));
  };

  const handleUpdatePoll = (updatedPoll: Poll) => {
    setPolls(prev => prev.map(p => p.id === updatedPoll.id ? updatedPoll : p));
  };

  const filteredPolls = polls.filter(p => 
    p.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show Landing if not connected
  if (!isConnected || !address) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 animate-fade-in">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => { setCurrentView(AppView.LIST); setActivePollId(null); }}
          >
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
              <Vote className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Voto<span className="text-indigo-600">Genius</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => open()}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono font-medium text-gray-600">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
            </div>
            
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" /> 
              <span className="hidden sm:inline">New Poll</span>
            </Button>
            
            <Button variant="ghost" onClick={() => disconnect()} title="Disconnect">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {showCreateModal && (
          <CreatePollModal 
            onClose={() => setShowCreateModal(false)} 
            onCreate={handleCreatePoll} 
          />
        )}

        {activePollId && activePoll ? (
          <PollView 
            poll={activePoll} 
            onVote={handleVote} 
            onUpdatePoll={handleUpdatePoll}
            onBack={() => { setActivePollId(null); setCurrentView(AppView.LIST); }}
          />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Active Polls</h1>
                <p className="text-gray-500">Cast your vote on trending topics.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search polls..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Poll Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolls.length > 0 ? (
                filteredPolls.map(poll => (
                  <Card key={poll.id} className="hover:shadow-md transition-all duration-200 flex flex-col h-full group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500">
                    <div 
                      className="p-6 flex flex-col h-full"
                      onClick={() => setActivePollId(poll.id)}
                    >
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {poll.question}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {poll.description || "No description provided."}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{poll.options.reduce((a, b) => a + b.votes, 0)} votes</span>
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                          {poll.options.length} Options
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No polls found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or create a new one.</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="secondary">
                    Create Poll
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
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
