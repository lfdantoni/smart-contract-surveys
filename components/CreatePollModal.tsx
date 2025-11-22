import React, { useState } from 'react';
import { generatePollFromTopic } from '../services/geminiService';
import { Button, Input, Label } from './UI';
import { Sparkles, Plus, Trash2, X } from 'lucide-react';
import { PollOption } from '../types';

interface CreatePollModalProps {
  onClose: () => void;
  onCreate: (question: string, description: string, options: string[]) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ onClose, onCreate }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const suggestion = await generatePollFromTopic(topic);
      setQuestion(suggestion.question);
      setDescription(suggestion.description || '');
      setOptions(suggestion.options);
    } catch (error) {
      console.error("Failed to generate", error);
      alert("Failed to generate poll suggestions. Please try again or fill manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty options
    const validOptions = options.filter(o => o.trim().length > 0);
    if (question && validOptions.length >= 2) {
      onCreate(question, description, validOptions);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Poll</h2>
            <p className="text-sm text-gray-500">Manually enter details or ask AI to help.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          {/* AI Section */}
          <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 space-y-4">
            <Label>✨ Start with an idea (Optional)</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., 'Best sci-fi movies of 2024' or 'Office lunch options'" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-white"
              />
              <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!topic.trim()}>
                <Sparkles className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </div>

          {/* Form Section */}
          <form id="create-poll-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input 
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                className="text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some context..."
              />
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input 
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    required={idx < 2} // First two are required
                  />
                  {options.length > 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                      onClick={() => removeOption(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addOption} size="sm" className="text-sm w-full">
                <Plus className="w-4 h-4" /> Add Option
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-poll-form">Create Poll</Button>
        </div>
      </div>
    </div>
  );
};