// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     HITLQueue.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-04-29
 * @summary    Componente para la gestión de la cola de revisión humana (HITL).
 */

import { API_BASE } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HITLItem {
    id: number;
    request_id: string;
    impact_level: string;
    original_request: { query: string };
    ai_proposed_response: string;
    created_at: string;
}

const HITLQueue: React.FC = () => {
    const { token, user } = useAuth();
    const [items, setItems] = useState<HITLItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actioningId, setActioningId] = useState<number | null>(null);

    const fetchQueue = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/v1/hitl/pending?tenant_id=${user?.tenant_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setItems(data);
            } else {
                console.error("HITL API returned non-array data:", data);
                setItems([]);
            }
        } catch (error) {
            console.error("Error fetching HITL queue:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'reject', notes: string = "") => {
        setActioningId(id);
        try {
            const response = await fetch(`${API_BASE}/api/v1/hitl/${id}/${action}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: action === 'reject' ? JSON.stringify({ notes }) : undefined
            });
            if (response.ok) {
                setItems(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error(`Error in HITL ${action}:`, error);
        } finally {
            setActioningId(null);
        }
    };

    if (isLoading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cian" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black font-title tracking-tight">Cola de Revisión <span className="text-cian">HITL</span></h3>
                <span className="px-4 py-1 bg-cian/10 border border-cian/20 rounded-full text-[10px] font-black text-cian tracking-widest uppercase">
                    {items.length} PENDIENTES
                </span>
            </div>

            <AnimatePresence>
                {items.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-30"
                    >
                        <Check size={48} className="mb-4" />
                        <p className="font-title font-bold uppercase tracking-widest text-sm">Todo en orden. No hay riesgos pendientes.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#050A1E] border border-white/10 rounded-[2rem] overflow-hidden group"
                            >
                                <div className="p-8 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                                                item.impact_level === 'CRITICAL' ? 'bg-red text-white' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                                {item.impact_level} IMPACT
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-600">ID: {item.request_id}</span>
                                        </div>
                                        
                                        <div>
                                            <label className="text-[9px] uppercase font-bold text-gray-500 mb-1 block">Consulta del Usuario</label>
                                            <p className="text-sm text-gray-300 font-medium italic">"{item.original_request.query}"</p>
                                        </div>

                                        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                                            <label className="text-[9px] uppercase font-bold text-gray-500 mb-2 block">Respuesta Propuesta por LexIA</label>
                                            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{item.ai_proposed_response}</p>
                                        </div>
                                    </div>

                                    <div className="md:w-64 flex flex-col gap-3 justify-center">
                                        <button 
                                            onClick={() => handleAction(item.id, 'approve')}
                                            disabled={actioningId === item.id}
                                            className="w-full py-4 bg-green-500 text-dark font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-green-500/20"
                                        >
                                            {actioningId === item.id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                            APROBAR
                                        </button>
                                        <button 
                                            onClick={() => handleAction(item.id, 'reject', "No cumple con criterios de neutralidad.")}
                                            disabled={actioningId === item.id}
                                            className="w-full py-4 bg-white/5 border border-white/10 text-red-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red/10 transition-all"
                                        >
                                            <X size={18} />
                                            RECHAZAR
                                        </button>
                                        <button className="w-full py-4 text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-cian transition-colors">
                                            <ExternalLink size={12} />
                                            Auditar XAI
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HITLQueue;
