import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaComments, FaTimes } from "react-icons/fa";

const SUGGESTIONS = [
  "How to register an account?",
  "Tell me about your DNA services.",
  "How can I contact support?",
  "How long does it take to get results?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  // Send message to backend API
  const sendMessage = async (msg) => {
    const text = msg || input;
    if (!text.trim()) return;
    const userMessage = { from: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/Chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.answer || "Sorry, I don't have an answer for that." }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "An error occurred, please try again later." }
      ]);
    }
    setIsLoading(false);
    setIsTyping(false);
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Quick suggestion click
  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-5 shadow-lg transition-all duration-300 animate-bounce"
          aria-label="Open chat"
        >
          <FaComments className="w-8 h-8" />
        </button>
      ) : (
        <div className="w-80 max-w-[90vw] h-[500px] flex flex-col bg-white rounded-xl shadow-2xl border border-blue-200 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2 text-white font-semibold">
              <FaRobot className="w-5 h-5" />
              Customer Support
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition"
              aria-label="Close chat"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 bg-blue-50 space-y-2 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow
                    ${msg.from === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border"}
                  animate-fade-in`}
                >
                  <span className="flex items-center gap-1">
                    {msg.from === "bot" && <FaRobot className="w-4 h-4 text-blue-400" />}
                    {msg.text}
                    {msg.from === "user" && <FaUser className="w-4 h-4 text-white" />}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border px-4 py-2 rounded-2xl shadow max-w-[70%] flex items-center gap-2 animate-pulse">
                  <FaRobot className="w-4 h-4 text-blue-400" />
                  <span className="dot-flashing"></span>
                  <span className="dot-flashing"></span>
                  <span className="dot-flashing"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 px-3 py-2 bg-blue-100 border-t">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="bg-white text-blue-600 border border-blue-300 rounded-full px-3 py-1 text-xs hover:bg-blue-50 transition"
              >
                {s}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="p-3 bg-white rounded-b-xl border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition disabled:opacity-50"
              disabled={isLoading || !input.trim()}
              aria-label="Send"
            >
              <FaPaperPlane className="w-5 h-5" />
            </button>
          </div>
          {/* Animations and custom scrollbar */}
          <style>
            {`
            .animate-fade-in-up {
              animation: fadeInUp 0.4s cubic-bezier(.39,.575,.565,1) both;
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(40px);}
              100% { opacity: 1; transform: translateY(0);}
            }
            .animate-fade-in {
              animation: fadeIn 0.3s;
            }
            @keyframes fadeIn {
              from { opacity: 0;}
              to { opacity: 1;}
            }
            .dot-flashing {
              width: 6px;
              height: 6px;
              margin: 0 1px;
              background: #60a5fa;
              border-radius: 50%;
              display: inline-block;
              animation: dotFlashing 1s infinite linear alternate;
            }
            @keyframes dotFlashing {
              0% { opacity: 0.2;}
              50% { opacity: 1;}
              100% { opacity: 0.2;}
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #c7d2fe;
              border-radius: 3px;
            }
            `}
          </style>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 