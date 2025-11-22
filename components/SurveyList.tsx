import React, { useState, useEffect } from 'react';
import { Poll } from '../types';
import { Card, Button } from './UI';
import { BarChart3, Search, RefreshCcw } from 'lucide-react';
import { fetchSurveyPolls } from '../services/surveyService';
import { useAccount } from 'wagmi';
import { PollView } from './PollView';

interface SurveyListProps {}

export const SurveyList: React.FC<SurveyListProps> = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      loadSurveys();
    }
  }, [isConnected, address]);

  const loadSurveys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const onChainPolls = await fetchSurveyPolls();
      setPolls(onChainPolls);
    } catch (err) {
      console.error('Failed to load surveys', err);
      setError('No pudimos cargar las encuestas on-chain.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id !== pollId) return poll;
        return {
          ...poll,
          options: poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      })
    );
    // Also update activePoll if it's the current poll
    if (activePoll?.id === pollId) {
      setActivePoll({
        ...activePoll,
        options: activePoll.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        ),
      });
    }
  };

  const handleUpdatePoll = (updatedPoll: Poll) => {
    setPolls((prev) =>
      prev.map((p) => (p.id === updatedPoll.id ? updatedPoll : p))
    );
    if (activePoll?.id === updatedPoll.id) {
      setActivePoll(updatedPoll);
    }
  };

  const filteredPolls = polls.filter((p) =>
    p.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If viewing a specific poll, show PollView
  if (activePoll) {
    return (
      <PollView
        poll={activePoll}
        onVote={handleVote}
        onUpdatePoll={handleUpdatePoll}
        onBack={() => setActivePoll(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 animate-spin">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Loading surveys...</h3>
        <p className="text-gray-500">Fetching on-chain data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-red-200">
        <h3 className="text-lg font-medium text-red-600">{error}</h3>
        <p className="text-gray-500">Check your connection or try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Surveys</h1>
          <p className="text-gray-500">Participate in on-chain surveys</p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="secondary"
            onClick={loadSurveys}
            disabled={isLoading}
            title="Refresh surveys from blockchain"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Survey Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolls.length > 0 ? (
          filteredPolls.map((poll) => (
            <Card
              key={poll.id}
              className="hover:shadow-md transition-all duration-200 flex flex-col h-full group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500"
            >
              <div
                className="p-6 flex flex-col h-full"
                onClick={() => setActivePoll(poll)}
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {poll.question}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {poll.description || "No description provided."}
                  </p>
                  
                  {poll.tokenAddress && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                      {poll.tokenLogo && (
                        <img 
                          src={poll.tokenLogo} 
                          alt={poll.tokenSymbol || 'Token'} 
                          className="w-5 h-5 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-600 font-medium">
                          {poll.tokenSymbol || 'Token'} Required
                        </p>
                        <p className="text-xs text-gray-500 font-mono truncate">
                          {poll.tokenAddress.substring(0, 6)}...{poll.tokenAddress.substring(poll.tokenAddress.length - 4)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>
                      {poll.options.reduce((a, b) => a + b.votes, 0)} votes
                    </span>
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
            <h3 className="text-lg font-medium text-gray-900">No surveys found</h3>
            <p className="text-gray-500">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
