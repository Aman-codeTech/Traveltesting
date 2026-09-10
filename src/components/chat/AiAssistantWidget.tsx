import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  Compass,
  ChevronDown,
  RotateCcw,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! 🙏 I am your **TravelSaathi AI Assistant**.\n\nAsk me anything about Indian destinations, budget optimizations, regional foods, or hidden gems!',
      timestamp: 'Just now',
      suggestions: [
        'Top places to visit in Jaipur',
        'Plan a 3-day trip under ₹15,000',
        'Best street food in Delhi',
        'Hidden gems in Agra',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.aiChat(text);
      if (res.success && res.reply) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: res.suggestions || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('No reply received');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having a little trouble connecting right now. Feel free to use the **Plan My Trip** wizard to design your customized journey!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Namaste! 🙏 I am your **TravelSaathi AI Assistant**.\n\nAsk me anything about Indian destinations, budget optimizations, regional foods, or hidden gems!',
        timestamp: 'Just now',
        suggestions: [
          'Top places to visit in Jaipur',
          'Plan a 3-day trip under ₹15,000',
          'Best street food in Delhi',
          'Hidden gems in Agra',
        ],
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all group border border-emerald-400/30"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#F9C74F] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F9C74F] rounded-full animate-ping"></span>
          </div>
          <span className="text-xs font-bold font-heading tracking-wide pr-1">Ask AI Saathi</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[600px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] px-5 py-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-[#F9C74F]" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-heading flex items-center space-x-1.5">
                  <span>TravelSaathi AI</span>
                  <span className="w-2 h-2 rounded-full bg-[#F9C74F]"></span>
                </h4>
                <p className="text-[10px] text-emerald-100">Live Tourism &amp; Itinerary Advisor</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1.5`}
                >
                  <div className="flex items-end space-x-2 max-w-[88%]">
                    {isAi && (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAi
                          ? 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs'
                          : 'bg-[#1B5E20] text-white shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line space-y-1">
                        {msg.text.split('\n').map((line, lIdx) => {
                          // Basic bold markdown parser
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={lIdx}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className="font-bold">
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions Chips (if AI message) */}
                  {isAi && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-8 pt-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#1B5E20] text-[10px] font-semibold transition"
                        >
                          {sug} →
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-8">
                <div className="w-4 h-4 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px]">Thinking with TravelSaathi AI...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Footer Bar */}
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <Link
              to="/plan-trip"
              onClick={() => setIsOpen(false)}
              className="text-[#1B5E20] font-bold flex items-center space-x-1 hover:underline"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Full Trip Planner</span>
            </Link>
            <Link
              to="/explore"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 font-medium hover:text-[#1B5E20]"
            >
              Explore Cities →
            </Link>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about cities, routes, budget..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-[#1B5E20] hover:bg-[#154a19] disabled:opacity-50 text-white rounded-xl transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
