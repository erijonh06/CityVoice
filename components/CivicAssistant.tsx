
import React, { useState, useRef, useEffect } from 'react';
import { chatWithCivicBuddy } from '../services/geminiService';
import { useTranslation } from '../TranslationContext';

const CivicAssistant: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hi! I'm CityVoice AI. I can help you report issues or answer city service questions! 🏙️" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsLoading(true);
    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    const responseText = await chatWithCivicBuddy(history, userMsg);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-24 right-6 z-[900] bg-gradient-to-r from-[#2D9B63] to-[#A9C942] text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all group active:scale-90">
        <span className="material-icons-round text-3xl">smart_toy</span>
      </button>
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-[900] w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right transition-colors">
          <div className="bg-gradient-to-r from-[#2D9B63] to-[#A9C942] p-4 flex justify-between items-center text-white">
            <h3 className="font-bold text-sm flex items-center gap-2"><span className="material-icons-round">auto_awesome</span> CityVoice AI</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><span className="material-icons-round">close</span></button>
          </div>
          <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-[#2D9B63] text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 rounded-bl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('askCityVoiceAI')} className="flex-1 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2D9B63]" />
            <button type="submit" disabled={isLoading} className="bg-[#2D9B63] text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"><span className="material-icons-round text-sm">send</span></button>
          </form>
        </div>
      )}
    </>
  );
};

export default CivicAssistant;
