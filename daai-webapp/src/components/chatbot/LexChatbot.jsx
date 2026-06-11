import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Trash2, GraduationCap } from "lucide-react";
import useChatbotStore from "../../store/chatbotStore";

export default function LexChatbot() {
  const { isOpen, messages, isTyping, toggleChat, sendMessage, clearChat } = useChatbotStore();
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4f46e5] text-white shadow-xl hover:scale-105 hover:bg-[#4338ca] active:scale-95 transition-all duration-300"
          title="Ask Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className="flex h-[520px] w-[360px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">DAAI Assistant</h3>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4 text-indigo-100" />
              </button>
              <button
                onClick={toggleChat}
                className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                    msg.sender === "user"
                      ? "bg-[#4f46e5] text-white rounded-br-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm rounded-bl-none">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about modules, assignments..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-md hover:bg-[#4338ca] active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:active:scale-100 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
