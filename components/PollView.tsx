import React, { useState } from 'react';
import { Poll, PollOption } from '../types';
import { Button, Card } from './UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzePollResults } from '../services/geminiService';
import { ArrowLeft, Sparkles, CheckCircle, Share2 } from 'lucide-react';

interface PollViewProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onBack: () => void;
  onUpdatePoll: (updatedPoll: Poll) => void;
}

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const PollView: React.FC<PollViewProps> = ({ poll, onVote, onBack, onUpdatePoll }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

  const handleVote = () => {
    if (selectedOption) {
      onVote(poll.id, selectedOption);
      setHasVoted(true);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePollResults(poll);
      onUpdatePoll({ ...poll, aiAnalysis: analysis });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to Polls
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
        {poll.description && <p className="text-gray-500 text-lg">{poll.description}</p>}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{totalVotes} votes</span>
          <span>•</span>
          <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Voting Section */}
        <div className="space-y-6">
          <Card className="p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Cast your vote</h2>
            {!hasVoted ? (
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex justify-between items-center group ${
                      selectedOption === option.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option.text}</span>
                    {selectedOption === option.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </button>
                ))}
                <Button 
                  className="w-full mt-6" 
                  onClick={handleVote}
                  disabled={!selectedOption}
                >
                  Vote Now
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Thanks for voting!</h3>
                  <p className="text-gray-500">Check out the results on the right.</p>
                </div>
                <Button variant="secondary" onClick={() => setHasVoted(false)} className="mx-auto">
                  Vote Again (Demo)
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Live Results</h2>
              <Button variant="ghost" size="sm" onClick={() => {}}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-64 w-full flex-grow">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poll.options} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="text" 
                    type="category" 
                    width={100} 
                    tick={{fontSize: 12}}
                    interval={0}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={32}>
                    {poll.options.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                {!poll.aiAnalysis ? (
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                     <p className="text-indigo-900 text-sm mb-3 font-medium">Want deeper insights?</p>
                     <Button 
                      onClick={handleAnalyze} 
                      variant="secondary"
                      isLoading={isAnalyzing}
                      className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze with Gemini AI
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2 text-indigo-800 font-semibold">
                       <Sparkles className="w-4 h-4" />
                       <span>AI Insight</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed italic">
                      "{poll.aiAnalysis}"
                    </p>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};