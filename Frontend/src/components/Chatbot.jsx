import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import chatbotApi from '../api/chatbotApi';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-teal-400" />
      </div>
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function Message({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-teal-500/20 border border-teal-500/30'
            : 'bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-teal-400" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-teal-400" />
        )}
      </div>
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-teal-500/20 border border-teal-500/30 text-white rounded-br-sm'
            : 'backdrop-blur-xl bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm'
        }`}
      >
        {text}
      </div>
    </div>
  );
}

const WELCOME = {
  role: 'assistant',
  text: "Hi! I'm your AI finance assistant. Ask me anything about your transactions - spending patterns, top categories, recent activity, and more.",
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const data = await chatbotApi.sendMessage(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl bg-slate-900/95">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">AI Finance Assistant</p>
                <p className="text-[10px] text-teal-400 leading-tight">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-0 max-h-[420px] min-h-[280px]">
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} text={msg.text} />
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <p className="text-xs text-rose-400 text-center py-2 px-4 bg-rose-500/10 rounded-xl border border-rose-500/20 mb-4">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-white/5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all disabled:opacity-50 max-h-28 leading-relaxed"
                style={{ overflowY: 'auto' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              Enter to send &nbsp;·&nbsp; Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 shadow-lg hover:shadow-teal-500/30 hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
        aria-label="Open AI finance chatbot"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}
