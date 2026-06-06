/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     SearchPage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @summary    Motor de búsqueda semántica NLP para jurisprudencia.
 */

import { API_BASE } from '../lib/api';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoading(true);

        try {
            // Usamos el endpoint específico de búsqueda semántica
            const response = await fetch(API_BASE + '/api/v1/assistant/search', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tenant_id: user?.tenant_id, query, limit: 5 })
            });
            const data = await response.json();
            
            // Mapeamos los resultados devueltos por el vector store
            setResults(data.results || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-12 max-w-6xl mx-auto">
            <div className="text-center">
                <h1 className="text-5xl font-black font-title mb-4 tracking-tight">
                    Búsqueda <span className="text-cian">Semántica</span>
                </h1>
                <p className="text-gray-400 font-light">Encuentre conceptos jurídicos, no solo palabras clave.</p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center text-gray-400">
                    <Search size={24} />
                </div>
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: ¿Cuáles son las penas por desacato en el código civil?"
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-cian/40 focus:ring-4 focus:ring-cian/5 transition-all outline-none backdrop-blur-xl"
                />
                <button 
                    disabled={isLoading}
                    className="absolute right-3 top-2.5 px-8 py-3.5 bg-cian text-dark font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'BUSCAR'}
                </button>
            </form>

            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map((res, i) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={i} 
                            className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-cian/20 transition-all flex items-start gap-6 group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-cian/10 flex items-center justify-center text-cian group-hover:bg-cian/20 transition-colors">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-cian font-bold">
                                        {res.metadata?.source || 'Documento Recuperado'}
                                    </span>
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-cian transition-colors" />
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{res.content}</p>
                            </div>
                        </motion.div>
                    ))
                ) : !isLoading && (
                    <div className="py-20 text-center opacity-20 italic font-light">
                        Ingrese una consulta para iniciar el mapeo neural.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
