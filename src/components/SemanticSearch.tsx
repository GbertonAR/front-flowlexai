// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     SemanticSearch.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-07
 * @summary    Componente de Búsqueda Semántica Nivel 2. Recuperación directa de fragmentos con metadatos.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Layers, FileText, Database } from 'lucide-react';

interface SearchResult {
    content: string;
    metadata: any;
    distance: number;
}

interface SemanticSearchProps {
    onClose: () => void;
    tenant_id: number;
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({ onClose, tenant_id }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/assistant/search', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dev-token-999'
                },
                body: JSON.stringify({ tenant_id, query, limit: 10 })
            });
            const data = await response.json();
            setResults(data.results || []);
        } catch (error) {
            console.error('Error in search:', error);
        } finally {
            setIsLoading(false);
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
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-5xl h-[85vh] bg-[#050A1E] border border-cian/20 rounded-[3rem] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)]"
            >
                {/* Header Search Bar */}
                <div className="px-10 py-8 border-b border-white/5 flex items-center gap-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cian opacity-50" size={24} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Explorar base de conocimiento soberana..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-lg focus:outline-none focus:border-cian/40 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-cian text-dark px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-cian/20 hover:scale-105 transition-transform"
                    >
                        Indexar
                    </button>
                    <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Results Section */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gradient-to-b from-transparent to-[#030712]">
                    {results.length === 0 && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Layers size={80} strokeWidth={1} />
                            <p className="mt-4 font-title font-bold text-xl tracking-tighter uppercase">Sin resultados en buffer</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {results.map((res, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cian/30 hover:bg-white/10 transition-all cursor-default relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                    <FileText size={60} />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-cian/10 text-cian flex items-center justify-center">
                                        <Database size={16} />
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-cian/60">Fragmento Vectorial #{idx + 1}</span>
                                    <span className="ml-auto text-[10px] font-mono text-gray-600">DIST: {res.distance.toFixed(4)}</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-6 italic">"{res.content}"</p>

                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(res.metadata).map(([k, v], i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] text-gray-500 uppercase font-mono">
                                            {k}: {String(v)}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="px-10 py-4 bg-dark border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cian animate-pulse"></div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Motor de Búsqueda Semántica Nivel 2 Activo</span>
                    </div>
                    <span className="text-[10px] text-gray-700 font-mono">LEXIA-SEARCH-NODE-01</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SemanticSearch;
