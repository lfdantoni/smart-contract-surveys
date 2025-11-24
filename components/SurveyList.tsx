import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Poll } from '../types';
import { Card, Button } from './UI';
import { BarChart3, Search, RefreshCcw } from 'lucide-react';
import { fetchContractPolls, SURVEY_CONTRACTS, prepareVoteData } from '../services/surveyService';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { PollView } from './PollView';

interface SurveyListProps {}

export const SurveyList: React.FC<SurveyListProps> = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContracts, setLoadingContracts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState<string | null>(null);
  
  const { address, isConnected, chain: currentChain } = useAccount();
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    if (isConnected && address) {
      loadSurveys();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isConfirmed) {
      setVotingStatus('✅ Vote confirmed on blockchain!');
      loadSurveys(); // Reload surveys after successful vote
      setTimeout(() => setVotingStatus(null), 5000);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
      setVotingStatus(`❌ Vote failed: ${writeError.message}`);
      setTimeout(() => setVotingStatus(null), 5000);
    }
  }, [writeError]);

  const loadSurveys = async () => {
    setError(null);
    
    try {
      const results = await Promise.all(
        SURVEY_CONTRACTS.map(async (contractAddress) => {
          setLoadingContracts(prev => new Set(prev).add(contractAddress.address));
          try {
            const contractPolls = await fetchContractPolls(contractAddress.address, contractAddress.chain);
            return contractPolls;
          } catch (err) {
            console.error(`Failed to load survey from ${contractAddress.address}`, err);
            return [];
          } finally {
            setLoadingContracts(prev => {
              const newSet = new Set(prev);
              newSet.delete(contractAddress.address);
              return newSet;
            });
          }
        })
      );

      const allPolls = results.flat();
      setPolls(prev => {
        const pollMap = new Map(prev.map(p => [p.id, p]));
        allPolls.forEach(poll => pollMap.set(poll.id, poll));
        return Array.from(pollMap.values());
      });
    } catch (err) {
      console.error('Failed to load surveys', err);
      setError('No pudimos cargar las encuestas on-chain.');
    }
  };

  const handleVote = async (pollId: string, answerIds: string[]) => {
    if (!address || answerIds.length === 0) return;

    setVotingStatus('🔄 Preparing vote transaction...');

    try {
      // Switch to Sepolia if not already
      const SEPOLIA_CHAIN_ID = 11155111;
      if (currentChain?.id !== SEPOLIA_CHAIN_ID) {
        setVotingStatus('🔄 Switching to Sepolia network...');
        await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID });
      }

      setVotingStatus('✍️ Please confirm the transaction in your wallet...');

      const poll = polls.find(p => p.id === pollId);
      if (!poll) throw new Error('Survey not found');

      const voteData = prepareVoteData(poll, answerIds);

      await writeContract({
        address: voteData.address,
        abi: voteData.abi,
        functionName: 'vote' as const,
        args: [voteData.args[0]],
        account: address,
        chain: voteData.chain,
      });

      setVotingStatus('⏳ Transaction submitted. Waiting for confirmation...');
    } catch (err: any) {
      console.error('Vote error:', err);
      if (err.message.includes('User rejected')) {
        setVotingStatus('❌ Transaction rejected by user');
      } else {
        setVotingStatus(`❌ Vote failed: ${err.message || 'Unknown error'}`);
      }
      setTimeout(() => setVotingStatus(null), 5000);
    }
  };

  const handleUpdatePoll = (updatedPoll: Poll) => {
    setPolls((prev) =>
      prev.map((p) => (p.id === updatedPoll.id ? updatedPoll : p))
    );
  };

  const filteredPolls = polls
    .filter((p) => p.question.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Open polls first
      if (a.isOpen === true && b.isOpen !== true) return -1;
      if (a.isOpen !== true && b.isOpen === true) return 1;
      return 0;
    });

  return (
    <Routes>
      <Route index element={
        <SurveyListMain 
          polls={filteredPolls}
          loadingContracts={loadingContracts}
          error={error}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loadSurveys={loadSurveys}
          votingStatus={votingStatus}
        />
      } />
      <Route path=":address" element={
        <SurveyDetailPage 
          polls={polls}
          onVote={handleVote}
          onUpdatePoll={handleUpdatePoll}
          isVoting={isPending || isConfirming}
          votingStatus={votingStatus}
        />
      } />
    </Routes>
  );
};

// Component for survey detail page
const SurveyDetailPage: React.FC<{
  polls: Poll[];
  onVote: (pollId: string, answerIds: string[]) => Promise<void>;
  onUpdatePoll: (poll: Poll) => void;
  isVoting: boolean;
  votingStatus: string | null;
}> = ({ polls, onVote, onUpdatePoll, isVoting, votingStatus }) => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const poll = polls.find(p => p.id === address);

  if (!poll) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-red-200">
        <h3 className="text-lg font-medium text-red-600">Survey not found</h3>
        <p className="text-gray-500 mb-4">The survey you're looking for doesn't exist or hasn't loaded yet.</p>
        <Button onClick={() => navigate('/surveys')}>Back to Surveys</Button>
      </div>
    );
  }

  return (
    <>
      {votingStatus && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-center font-medium">
          {votingStatus}
        </div>
      )}
      <PollView
        poll={poll}
        onVote={onVote}
        onUpdatePoll={onUpdatePoll}
        onBack={() => navigate('/surveys')}
        isVoting={isVoting}
      />
    </>
  );
};

// Component for survey list main view
const SurveyListMain: React.FC<{
  polls: Poll[];
  loadingContracts: Set<string>;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadSurveys: () => void;
  votingStatus: string | null;
}> = ({ polls, loadingContracts, error, searchQuery, setSearchQuery, loadSurveys, votingStatus }) => {
  const navigate = useNavigate();
  const isLoading = loadingContracts.size > 0;

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
      {votingStatus && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-center font-medium">
          {votingStatus}
        </div>
      )}

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
        {/* Show skeletons for loading contracts */}
        {Array.from(loadingContracts).map((contractAddress) => (
          <Card key={contractAddress} className="flex flex-col h-full animate-pulse">
            <div className="p-6 flex flex-col h-full">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex-grow"></div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}

        {/* Show actual polls */}
        {polls.length > 0 ? (
          polls.map((poll) => (
            <Card
              key={poll.id}
              className="hover:shadow-md transition-all duration-200 flex flex-col h-full group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500"
            >
              <div
                className="p-6 flex flex-col h-full"
                onClick={() => navigate(`/surveys/${poll.id}`)}
              >
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex-1">
                      {poll.question}
                    </h3>
                    {poll.isOpen === true && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                        Open
                      </span>
                    )}
                    {poll.isOpen === false && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">
                        Closed
                      </span>
                    )}
                  </div>
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
          !isLoading && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No surveys found</h3>
              <p className="text-gray-500">Try adjusting your search or refresh to load surveys</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
