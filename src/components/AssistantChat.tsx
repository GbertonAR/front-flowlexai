// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     AssistantChat.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-07
 * @summary    Componente de Chat para el Asistente Legislativo AI. Interacción asíncrona con XAI.
 */

import { API_BASE } from '../lib/api';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, X, Loader2, MessageSquareQuote } from 'lucide-react';
import XAICard from './XAICard';
import { useAuth } from '../context/AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    xai_card?: any;
    request_id?: string;
    requires_hitl?: boolean;
}

interface AssistantChatProps {
    onClose: () => void;
    tenant_id: number;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ onClose, tenant_id }) => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(API_BASE + '/api/v1/assistant/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tenant_id: user?.tenant_id, query: input })
            });

            if (!response.ok) throw new Error('Error en el servidor');

            const data = await response.json();
            const assistantMsg: Message = {
                role: 'assistant',
                content: data.response,
                xai_card: data.xai_card,
                request_id: data.request_id,
                requires_hitl: data.requires_hitl
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Infortunadamente, ha ocurrido un error técnico en el motor LexIA. Por favor, reintente en unos instantes.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-4xl h-[80vh] bg-[#0A1128] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-accent to-blue flex items-center justify-center text-dark">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="font-title font-black text-xl tracking-tight">{t('assistant.title')} <span className="text-accent font-mono text-[10px] ml-2 tracking-widest">WFD-V3</span></h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{t('assistant.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="text-6xl mb-4">🏛️</div>
                            <p className="text-lg font-light text-gray-400">Bienvenido al flujo de conocimiento LexIA.<br />Inicie su consulta legislativa para comenzar el análisis.</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${msg.role === 'user' ? 'bg-purple/20 text-purple' : 'bg-accent/20 text-accent'}`}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="space-y-4">
                                    <div className={`p-6 rounded-3xl ${
                                        msg.role === 'user' 
                                            ? 'bg-purple/10 border border-purple/20 rounded-tr-none' 
                                            : msg.requires_hitl
                                                ? 'bg-red/10 border border-red/20 rounded-tl-none text-red-200'
                                                : 'bg-white/5 border border-white/10 rounded-tl-none text-gray-200'
                                    }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        {msg.request_id && (
                                            <div className={`mt-4 flex items-center gap-2 text-[10px] font-mono ${msg.requires_hitl ? 'text-red-400' : 'text-gray-600'}`}>
                                                <MessageSquareQuote size={12} />
                                                REF: {msg.request_id} {msg.requires_hitl && '· [STATUS: BLOCKED BY HITL]'}
                                            </div>
                                        )}
                                    </div>
                                    {msg.xai_card && <XAICard data={msg.xai_card} />}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tl-none flex items-center gap-4">
                                <div className="flex gap-1">
                                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">{t('assistant.processing')}</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer Input */}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="p-8 border-t border-white/5 bg-dark/20 backdrop-blur-xl"
                >
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('assistant.placeholder')}
                            className="w-full bg-[#030610] border border-white/10 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-3 top-2.5 p-3 rounded-xl bg-accent text-dark hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AssistantChat;
