// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     XAICard.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-07
 * @summary    Componente de visualización de Explicabilidad Algorítmica (WFD Dir 5.2).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, Link, ChevronDown, ChevronUp } from 'lucide-react';

interface XAISource {
    source_name: string;
    weight: number;
    impact_level: string;
}

interface XAIPayload {
    confidence_score: number;
    reasoning_steps: string[];
    sources: XAISource[];
    limitations: string[];
    wfd_compliance_ref: string;
    ai_model_version: string;
}

const XAICard: React.FC<{ data: XAIPayload }> = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-4">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20"
            >
                <Info size={16} />
                <span className="uppercase tracking-widest">{isExpanded ? 'Ocultar Razonamiento XAI' : 'Ver Razonamiento XAI'}</span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 rounded-2xl bg-white/5 border border-accent/20 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                    <Info size={20} />
                                </div>
                                <h4 className="font-title font-bold text-sm uppercase tracking-widest text-accent">Tarjeta de Explicabilidad XAI</h4>
                            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Col: Reasoning & Sources */}
                <div>
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-3">Fuentes Utilizadas</span>
                    <div className="space-y-3">
                        {data.sources.map((src, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-white/5">
                                <span className="text-gray-300 font-medium">{src.source_name}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${src.impact_level === 'HIGH' ? 'bg-red/20 text-red-400' : 'bg-green/20 text-green-400'}`}>
                                    {src.impact_level} IMPACT
                                </span>
                            </div>
                        ))}
                    </div>

                    <span className="text-[10px] uppercase text-gray-500 font-bold block mt-6 mb-3">Pasos de Razonamiento</span>
                    <ul className="text-xs text-gray-400 space-y-2">
                        {data.reasoning_steps.map((step, idx) => (
                            <li key={idx} className="flex gap-2">
                                <CheckCircle size={14} className="text-accent shrink-0" />
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Col: Score & Metadata */}
                <div className="flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-3">Nivel de Confianza</span>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-title font-black text-white">{(data.confidence_score * 100).toFixed(0)}%</span>
                            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.confidence_score * 100}%` }}
                                    className="h-full bg-gradient-to-r from-accent to-blue"
                                />
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-red/5 border border-red/10">
                            <div className="flex items-center gap-2 mb-2 text-red-400">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] uppercase font-bold">Limitaciones</span>
                            </div>
                            <ul className="text-[10px] text-gray-500 space-y-1 italic leading-snug">
                                {data.limitations.map((lim, idx) => <li key={idx}>• {lim}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end text-[9px] text-gray-600 font-mono">
                        <div className="space-y-1">
                            <div>MODEL: {data.ai_model_version}</div>
                            <div>COMPLIANCE: {data.wfd_compliance_ref}</div>
                        </div>
                        <div className="flex items-center gap-1 text-accent/60">
                            <Link size={10} />
                            <span>VERIFICAR LINAJE</span>
                        </div>
                    </div>
                </div>
            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default XAICard;
