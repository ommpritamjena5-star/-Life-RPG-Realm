import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  RotateCcw,
  Zap,
  HelpCircle,
  Sword,
  Shield,
  Timer,
  Coins,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/soundEngine';

export const OracleChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'oracle',
      title: '🧙 Aura • Grand Archmage Oracle',
      text: `Greetings, ${user?.name || 'Adventurer'}! I am **Aura**, your personal AI Game Master & Oracle of Life RPG.

Ask me anything about **XP formulas**, **Dynamic Archetypes (Warrior, Mage, Rogue, Paladin)**, **Sloth Penalties**, **Focus Sessions**, or how to master your daily habits!`,
      suggestions: [
        '⚔️ How do I level up fast?',
        '🧙 How do Archetypes unlock?',
        '💀 How do Sloth Penalties work?',
        '⏱️ How do Focus Sessions work?',
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    sound.playClick();
    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          userContext: user
            ? {
                name: user.name,
                level: user.level,
                characterClass: user.characterClass,
                streak: user.streak,
                gold: user.gold,
              }
            : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        sound.playPurchase();
        const oracleMsg = {
          id: 'oracle_' + Date.now(),
          sender: 'oracle',
          title: data.title || '🧙 Oracle Guidance',
          text: data.reply,
          suggestions: data.suggestions || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, oracleMsg]);
      } else {
        throw new Error('Failed to consult Oracle');
      }
    } catch (e) {
      const errorMsg = {
        id: 'oracle_err_' + Date.now(),
        sender: 'oracle',
        title: '⚠️ Astral Disturbance',
        text: 'The arcane connection wavered. In short: Complete quests to earn XP/Gold, maintain daily streaks to avoid Sloth Penalties, and your Archetype will evolve dynamically!',
        suggestions: ['How do I level up?', 'Tell me about Archetypes'],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    // Simple markdown parser for bold, code, and bullet points
    return text.split('\n').map((line, idx) => {
      let formatted = line;
      // Bold **text**
      const parts = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-amber-300 font-extrabold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : line;

      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-0.5">
            {content}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-slate-200 my-0.5 leading-relaxed">
          {content}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Oracle Orb Trigger Button */}
      <div className="fixed bottom-20 xl:bottom-6 right-4 sm:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            sound.playClick();
            setIsOpen(!isOpen);
          }}
          className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-purple-500/40 border border-amber-300/40 cursor-pointer flex items-center justify-center group"
          title="Oracle AI Companion • Get Game Guidance"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-950" />
          ) : (
            <>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-950" />
              <Bot className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />
            </>
          )}
        </motion.button>
      </div>

      {/* Oracle AI Chat Window Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-24 xl:bottom-20 right-3 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[620px] h-[80vh] flex flex-col rounded-3xl bg-[#07080e]/98 border-2 border-purple-500/40 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 p-[1px] shadow-md shadow-purple-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-xl">
                    🧙
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-rpg font-black text-sm text-slate-100 uppercase tracking-wide">
                      Aura Oracle
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                    AI Game Master & Guide
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMessages([
                      {
                        id: 'welcome_' + Date.now(),
                        sender: 'oracle',
                        title: '🧙 Aura • Grand Archmage Oracle',
                        text: `Realm refreshed! How may I assist your hero journey today, **${user?.name || 'Adventurer'}**?`,
                        suggestions: [
                          '⚔️ How do I level up fast?',
                          '🧙 How do Archetypes unlock?',
                          '💀 How do Sloth Penalties work?',
                          '⏱️ How do Focus Sessions work?',
                        ],
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ]);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Clear Chat History"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Minimize Oracle"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Badge */}
                  {msg.sender === 'oracle' && msg.title && (
                    <div className="flex items-center gap-1.5 mb-1 px-2 text-[10px] font-rpg font-bold text-amber-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{msg.title}</span>
                      <span className="text-slate-500 ml-auto font-normal lowercase">{msg.time}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-purple-500/20 border border-purple-400/40'
                        : 'bg-slate-900/90 text-slate-200 rounded-tl-none border border-purple-500/30 shadow-lg'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Quick Action Suggestion Chips (if Oracle message) */}
                  {msg.sender === 'oracle' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          className="px-2.5 py-1 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 hover:border-amber-400/60 text-purple-200 hover:text-amber-300 text-[10px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 max-w-[120px]">
                  <span className="text-[10px] text-purple-300 font-bold">Oracle is channeling</span>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-purple-500/30 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Aura anything about Life RPG..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-40 cursor-pointer hover:from-amber-300 transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
