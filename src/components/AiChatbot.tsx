import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Database, ShieldAlert, Minimize2, MessageSquare, Trash2, ArrowRight, Save } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface AiChatbotProps {
  chatHistory: Message[];
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
  onClearHistory: () => void;
  contextActiveCompany?: string;
  onSaveChat?: (title: string) => void;
  savedChats?: any[];
  onLoadChat?: (chat: any) => void;
}

export default function AiChatbot({
  chatHistory,
  onSendMessage,
  loading,
  onClearHistory,
  contextActiveCompany,
  onSaveChat,
  savedChats = [],
  onLoadChat
}: AiChatbotProps) {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = () => {
    if (!userInput.trim() || loading) return;
    onSendMessage(userInput);
    setUserInput('');
  };

  const PROMPTS = [
    { text: "Which BSI100 stocks display the highest ROE & lowest debt?", category: "Analysis" },
    { text: "Who are the top security risk leaders in the Banking sector?", category: "Cybersecurity" },
    { text: "Explain how DuPont ROCE ratios influence long-term company value.", category: "Education" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden" id="ai-chat-assitant-box">
      {/* Header bar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-950/40">
            <Bot className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-white tracking-wide flex items-center gap-1.5">
              NIFTY AI Intelligent Assistant
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">MODELS: GEMINI-3.5-FLASH &bull; CHAT CONTEXT</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSaveChat && chatHistory.length > 0 && (
            <button
              onClick={() => {
                const timestampStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                const promptedTitle = prompt("Provide an audit title for this preserved consultation:", `Analyst Consultation (${timestampStr})`);
                if (promptedTitle && promptedTitle.trim()) {
                  onSaveChat(promptedTitle.trim());
                  alert("Conversation session recorded successfully! Re-load or browse this thread in yourSettings Profile at any time.");
                }
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-750 transition-all cursor-pointer"
              title="Save this analysis session"
            >
              <Save className="h-3.5 w-3.5" />
              Save Thread
            </button>
          )}

          {chatHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-350 font-mono flex items-center gap-1 bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-750 transition-all cursor-pointer"
              title="Wipe conversation logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* Suggestion alert for contextual models */}
      {contextActiveCompany && (
        <div className="bg-slate-950/60 border-b border-slate-850 px-4 py-2 flex items-center gap-2 text-[11px] font-mono text-indigo-400">
          <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
          <span>Active Context focus is currently set to: <strong>{contextActiveCompany}</strong></span>
        </div>
      )}

      {/* Messages thread container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center py-10 text-center space-y-6">
            <Bot className="h-12 w-12 text-indigo-500/40" />
            <div className="space-y-1">
              <h4 className="text-sm font-display font-medium text-white">How can NIFTY Intelligence assist you today?</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Powered by Gemini. Ask absolutely anything—from corporate stock fundamentals, coding advice, history, math, to regional compliance regulations.
              </p>
            </div>

            <div className="w-full max-w-lg grid grid-cols-1 gap-2.5 pt-2">
              {PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p.text)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 transition-all font-sans text-xs text-slate-350 flex items-center justify-between cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900/40 uppercase uppercase">{p.category}</span>
                    <span>{p.text}</span>
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar wrapper */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isUser ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-indigo-950 border-indigo-900 text-indigo-400'
                  }`}>
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Bubble body content */}
                  <div className={`p-3.5 rounded-xl text-xs space-y-1 select-text ${
                    isUser 
                      ? 'bg-gradient-to-tr from-sky-950 to-indigo-950 border border-indigo-900/40 text-slate-100' 
                      : 'bg-slate-950/80 border border-slate-850 text-slate-300 shadow-inner'
                  }`}>
                    <div className="whitespace-pre-line leading-relaxed text-[11px] prose prose-invert font-sans">
                      {msg.parts[0].text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated loading indicator block */}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-900 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850 text-slate-500 text-xs italic flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-spin" />
                  <span>Thinking & fetching financial ledger references...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer message composer */}
      <div className="p-4 bg-slate-950 border-t border-slate-850 flex gap-2">
        <input
          type="text"
          placeholder="Ask anything! Profitability, stock metrics, compliance, coding, science, history..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
        />
        <button
          onClick={handleSend}
          disabled={loading || !userInput.trim()}
          className="h-10 w-10 shrink-0 bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
