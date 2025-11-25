import React, { useState } from 'react';
import { Poll, PollOption } from '../types';
import { Button, Card } from './UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzePollResults } from '../services/geminiService';
import { ArrowLeft, Sparkles, CheckCircle, Share2 } from 'lucide-react';

interface PollViewProps {
  poll: Poll;
  onVote: (pollId: string, answerIds: string[]) => void;
  onBack: () => void;
  onUpdatePoll: (updatedPoll: Poll) => void;
  isVoting?: boolean;
}

interface Question {
  id: number;
  text: string;
  answers: Array<{ id: string; text: string; votes: number }>;
}

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const PollView: React.FC<PollViewProps> = ({ poll, onVote, onBack, onUpdatePoll, isVoting }) => {
  // Map of questionId -> selected answerId
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

  // Group options by question
  const questions: Question[] = React.useMemo(() => {
    const questionsMap = new Map<number, Question>();
    
    poll.options.forEach(option => {
      const [questionId, answerId] = option.id.split('-').map(Number);
      const questionText = option.text.match(/^Q\d+: (.+?) - /)?.[1] || 'Question';
      const answerText = option.text.split(' - ').slice(1).join(' - ');
      
      if (!questionsMap.has(questionId)) {
        questionsMap.set(questionId, {
          id: questionId,
          text: questionText,
          answers: []
        });
      }
      
      questionsMap.get(questionId)!.answers.push({
        id: option.id,
        text: answerText,
        votes: option.votes
      });
    });
    
    return Array.from(questionsMap.values()).sort((a, b) => a.id - b.id);
  }, [poll.options]);

  const handleVote = async () => {
    // Extract all selected answer IDs
    const answerIds = Object.values(selectedAnswers);
    
    if (answerIds.length === questions.length) {
      await onVote(poll.id, answerIds);
      // Don't set hasVoted here - let the parent handle transaction confirmation
    }
  };

  const handleSelectAnswer = (questionId: number, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const allQuestionsAnswered = Object.keys(selectedAnswers).length === questions.length;

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
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">{poll.question}</h1>
          {poll.isOpen !== undefined && (
            <span className={`ml-4 px-3 py-1.5 rounded-full text-sm font-medium ${
              poll.isOpen 
                ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800' 
                : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800'
            }`}>
              {poll.isOpen ? '🟢 Voting Open' : '🔴 Voting Closed'}
            </span>
          )}
        </div>
        {poll.description && <p className="text-gray-500 dark:text-gray-400 text-lg">{poll.description}</p>}
        
        {poll.tokenAddress && (
          <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-900 mt-3">
            {poll.tokenLogo && (
              <img 
                src={poll.tokenLogo} 
                alt={poll.tokenSymbol || 'Token'} 
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                {poll.tokenSymbol || 'Token'} Required to Vote
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                {poll.tokenAddress}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <span>{totalVotes} votes</span>
        </div>
      </div>

      {poll.isOpen ? (
        /* Show only voting section when poll is open */
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Cast your vote</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select one answer for each question</p>
            {!hasVoted ? (
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      Question {question.id}: {question.text}
                    </h3>
                    <div className="space-y-2 ml-4">
                      {question.answers.map((answer) => (
                        <button
                          key={answer.id}
                          onClick={() => handleSelectAnswer(question.id, answer.id)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all flex justify-between items-center group ${
                            selectedAnswers[question.id] === answer.id
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100">{answer.text}</span>
                          {selectedAnswers[question.id] === answer.id && (
                            <CheckCircle className="w-5 h-5 text-indigo-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button 
                  className="w-full mt-6" 
                  onClick={handleVote}
                  disabled={!allQuestionsAnswered || isVoting}
                >
                  {isVoting ? 'Processing...' : `Vote Now (${Object.keys(selectedAnswers).length}/${questions.length})`}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Thanks for voting!</h3>
                  <p className="text-gray-500 dark:text-gray-400">Your vote has been recorded.</p>
                </div>
                <Button variant="secondary" onClick={() => setHasVoted(false)} className="mx-auto">
                  Vote Again (Demo)
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Show only results section when poll is closed */
        <div className="space-y-6">
          {questions.map((question) => {
            const questionTotalVotes = question.answers.reduce((sum, a) => sum + a.votes, 0);
            
            return (
              <Card key={question.id} className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Question {question.id}: {question.text}
                </h3>
                
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={question.answers.map((ans) => ({ name: ans.text, votes: ans.votes }))}>
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes" radius={8}>
                      {question.answers.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-3 mt-4">
                  {question.answers.map((answer, idx) => {
                    const percentage = questionTotalVotes > 0 ? ((answer.votes / questionTotalVotes) * 100).toFixed(1) : '0';
                    return (
                      <div key={answer.id} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{answer.text}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</span>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{answer.votes}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          <Card className="p-6">
            {!poll.aiAnalysis ? (
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4 text-center">
                <p className="text-indigo-900 dark:text-indigo-300 text-sm mb-3 font-medium">Want deeper insights?</p>
                <Button 
                  onClick={handleAnalyze} 
                  variant="secondary"
                  isLoading={isAnalyzing}
                  className="w-full text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with Gemini AI
                </Button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-5 border border-indigo-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-indigo-800 dark:text-indigo-300 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Insight</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                  "{poll.aiAnalysis}"
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};