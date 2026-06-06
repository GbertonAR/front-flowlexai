// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     ComparePage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-04-29
 * @summary    Página de análisis comparativo elite con Impact Delta y Visual Diff.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Columns, Play, AlertCircle, CheckCircle2, ChevronRight, FileCode, Upload, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Finding {
    item: string;
    heading: string;
    status: 'MODIFIED' | 'ADDED' | 'DELETED' | 'UNCHANGED';
    analysis: {
        impact_summary: string;
        risk_level: string;
        tags: string[];
        technical_diff?: string;
    };
}

const ComparePage = () => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [xmlA, setXmlA] = useState('');
    const [xmlB, setXmlB] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [executiveSummary, setExecutiveSummary] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (target === 'A') setXmlA(content);
            else setXmlB(content);
        };
        reader.readAsText(file);
    };

    const handleAnalyze = async () => {
        if (!xmlA || !xmlB) return;
        setIsAnalyzing(true);
        setFindings([]);
        setExecutiveSummary('');
        
        try {
            const response = await fetch('/api/v1/compare/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ xml_a: xmlA, xml_b: xmlB })
            });
            const data = await response.json();
            setFindings(data.findings);
            setExecutiveSummary(data.executive_summary);
        } catch (error) {
            console.error('Error analyzing comparison:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-10 max-w-[1400px] mx-auto space-y-12 pb-32">
            {/* Header Elite */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-6xl font-black font-title tracking-tighter mb-4">
                        Delta <span className="text-linear-to-r from-accent to-blue bg-clip-text text-transparent">Semántico</span>
                    </h1>
                    <p className="text-gray-400 font-light max-w-2xl text-lg">
                        Identificación neuronal de cambios normativos y su impacto en la seguridad jurídica.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !xmlA || !xmlB}
                        className="flex items-center gap-3 bg-accent hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 text-dark px-10 py-5 rounded-[1.5rem] font-black transition-all shadow-2xl shadow-accent/20 uppercase text-xs tracking-widest"
                    >
                        {isAnalyzing ? <Sparkles className="animate-pulse" size={20} /> : <Play size={20} />}
                        {isAnalyzing ? 'Procesando Delta...' : 'Ejecutar Análisis'}
                    </button>
                </div>
            </header>

            {/* Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Versión de Referencia (A)</label>
                        <label className="cursor-pointer text-accent hover:text-white transition-colors">
                            <Upload size={16} />
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'A')} />
                        </label>
                    </div>
                    <textarea
                        value={xmlA}
                        onChange={(e) => setXmlA(e.target.value)}
                        placeholder="Pegue el XML Akoma Ntoso de la versión base..."
                        className="w-full h-[400px] bg-[#050A1E] border border-white/5 rounded-[2.5rem] p-8 text-sm font-mono focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none scrollbar-hide text-gray-400"
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">Versión Propuesta (B)</label>
                        <label className="cursor-pointer text-accent hover:text-white transition-colors">
                            <Upload size={16} />
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'B')} />
                        </label>
                    </div>
                    <textarea
                        value={xmlB}
                        onChange={(e) => setXmlB(e.target.value)}
                        placeholder="Pegue el XML Akoma Ntoso de la nueva versión..."
                        className="w-full h-[400px] bg-[#050A1E] border border-white/5 rounded-[2.5rem] p-8 text-sm font-mono focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none scrollbar-hide text-gray-400"
                    />
                </div>
            </div>

            {/* Results Section */}
            <AnimatePresence>
                {(findings.length > 0 || executiveSummary) && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Executive Summary Card */}
                        {executiveSummary && (
                            <section className="bg-linear-to-br from-purple/10 to-blue/10 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-accent text-dark flex items-center justify-center">
                                        <Sparkles size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black font-title tracking-tight">Resumen de Impacto <span className="text-accent">Global</span></h2>
                                </div>
                                <div className="text-gray-300 text-lg font-light leading-relaxed whitespace-pre-wrap max-w-4xl">
                                    {executiveSummary}
                                </div>
                            </section>
                        )}

                        {/* Granular Findings */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black font-title flex items-center gap-4">
                                    <Columns className="text-cian" />
                                    Análisis Granular por Artículo
                                </h3>
                                <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {findings.filter(f => f.status !== 'UNCHANGED').length} Cambios Detectados
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {findings.map((finding, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${
                                            finding.status === 'MODIFIED' ? 'bg-blue/5 border-blue/20 hover:border-blue/40' :
                                            finding.status === 'ADDED' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' :
                                            finding.status === 'DELETED' ? 'bg-red/5 border-red/20 hover:border-red/40' : 'bg-white/2 border-white/5 opacity-60'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    finding.status === 'MODIFIED' ? 'bg-blue/20 text-blue' :
                                                    finding.status === 'ADDED' ? 'bg-green-500/20 text-green-400' :
                                                    finding.status === 'DELETED' ? 'bg-red/20 text-red' : 'bg-gray-500/20 text-gray-500'
                                                }`}>
                                                    <FileCode size={16} />
                                                </div>
                                                <span className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase">{finding.item}</span>
                                            </div>
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                                                finding.status === 'MODIFIED' ? 'bg-blue text-dark' :
                                                finding.status === 'ADDED' ? 'bg-green-500 text-dark' :
                                                finding.status === 'DELETED' ? 'bg-red text-white' : 'bg-gray-500/20 text-gray-500'
                                            }`}>
                                                {finding.status}
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-lg mb-3 group-hover:text-white transition-colors">{finding.heading || 'Artículo sin rúbrica'}</h4>
                                        <p className="text-sm text-gray-400 font-light mb-6 leading-relaxed">
                                            {finding.analysis.impact_summary}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {finding.analysis.tags.map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[9px] bg-white/5 text-gray-500 px-3 py-1 rounded-lg border border-white/5 uppercase font-bold tracking-widest">
                                                    #{tag}
                                                </span>
                                            ))}
                                            <span className={`ml-auto text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                                                finding.analysis.risk_level === 'HIGH' ? 'border-red/30 text-red' :
                                                finding.analysis.risk_level === 'MEDIUM' ? 'border-orange-500/30 text-orange-400' : 'border-green-500/30 text-green-500'
                                            }`}>
                                                {finding.analysis.risk_level} RISK
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ComparePage;
