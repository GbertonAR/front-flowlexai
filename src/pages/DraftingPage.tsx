/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     DraftingPage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @summary    Editor legislativo asistido por IA con guía educativa interactiva y técnica legislativa avanzada.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PenTool, Save, Sparkles, FileText, ShieldAlert, Cpu, 
    Upload, Loader2, AlertTriangle, CheckCircle2, Info,
    BookOpen, Scale, Zap, ShieldCheck, ArrowRight, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DraftingPage = () => {
    const { token } = useAuth();
    const [content, setContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const handleAnalyze = async () => {
        if (!content.trim()) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/v1/drafting/analyze', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ draft: content })
            });

            if (!response.ok) throw new Error('Error en el análisis');
            const data = await response.json();
            setAnalysis(data);
        } catch (error) {
            console.error("Error analizando impacto:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/v1/drafting/extract', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Error en la extracción');
            const data = await response.json();
            setContent(data.text);
            setAnalysis(null);
        } catch (error) {
            console.error("Error cargando archivo:", error);
        } finally {
            setIsExtracting(false);
        }
    };

    const eduCards = [
        {
            title: "Recomendaciones",
            icon: <Sparkles className="text-purple" size={24} />,
            desc: "Sugerencias IA para mitigar sesgos y optimizar la técnica legislativa.",
            detail: "LexIA analiza el lenguaje para asegurar que sea inclusivo, técnico y no discriminatorio, sugiriendo términos jurídicamente más precisos.",
            bad: "El Presidente deberá...",
            good: "La Presidencia o quien ostente el cargo...",
            color: "border-purple/20 bg-purple/5",
            accent: "text-purple"
        },
        {
            title: "Equilibrio Político",
            icon: <Scale className="text-blue-400" size={24} />,
            desc: "Clasificación de la tendencia ideológica predominante en el texto.",
            detail: "Permite entender cómo será percibido el proyecto. Un equilibrio 'Neutral' indica una técnica técnica y objetiva.",
            bad: "...la mano invisible del mercado.",
            good: "...el fomento de la libre competencia regulada.",
            color: "border-blue-500/20 bg-blue-500/5",
            accent: "text-blue-400"
        },
        {
            title: "Alerta de Sesgo",
            icon: <AlertTriangle className="text-orange-400" size={24} />,
            desc: "Porcentaje de desviación respecto a la neutralidad técnica.",
            detail: "Un score alto indica que el proyecto podría ser cuestionado por falta de objetividad o favoritismo a sectores específicos.",
            bad: "...este nefasto sistema anterior.",
            good: "...el régimen normativo precedente.",
            color: "border-orange-500/20 bg-orange-500/5",
            accent: "text-orange-400"
        },
        {
            title: "Seguridad Jurídica",
            icon: <ShieldCheck className="text-green-400" size={24} />,
            desc: "Consistencia con el Corpus Soberano de leyes y decretos vigentes.",
            detail: "Asegura que la nueva norma no genere vacíos legales, contradicciones jerárquicas o inconstitucionalidades.",
            bad: "Deróguese toda ley que se oponga...",
            good: "Modifíquese el Art. 5 de la Ley 26.123...",
            color: "border-green-500/20 bg-green-500/5",
            accent: "text-green-400"
        }
    ];

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-10 gap-8">
                <div className="max-w-2xl">
                    <h1 className="text-6xl font-black font-title mb-4 tracking-tighter leading-none">
                        Redacción <span className="text-purple">Asistida</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-light italic">Refine sus proyectos con la precisión ética de LexIA.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <label className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 transition-all flex items-center gap-3 cursor-pointer group">
                        {isExtracting ? <Loader2 className="animate-spin text-purple" size={20} /> : <Upload size={20} className="group-hover:text-purple transition-colors" />}
                        <span className="uppercase text-xs tracking-widest font-black">Cargar Archivo</span>
                        <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileLoad} disabled={isExtracting} />
                    </label>
                    
                    <button className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 transition-all flex items-center gap-3 uppercase text-xs tracking-widest font-black">
                        <Save size={20} /> Guardar
                    </button>
                    
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !content}
                        className={`px-10 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-3 uppercase text-xs tracking-widest ${
                            isAnalyzing ? 'bg-gray-700' : 'bg-linear-to-r from-purple to-magenta text-white shadow-purple/40 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        Analizar Impacto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* TOP ROW: Editor & Bias Analysis */}
                <div className="lg:col-span-2">
                    <div className="bg-[#020512] border-2 border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] relative group">
                        <div className="px-10 py-5 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                            </div>
                            <span className="text-xs font-mono text-white uppercase tracking-[0.4em] font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                Editor Soberano v1.2 // <span className="text-green-400">Audit_Mode_Active</span>
                            </span>
                        </div>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Inicie la redacción soberana aquí..."
                            className="w-full h-[600px] bg-transparent p-14 text-2xl leading-relaxed text-gray-200 focus:outline-none resize-none font-serif placeholder:text-gray-800 selection:bg-purple/40"
                        />
                        <div className="absolute bottom-8 right-10 text-xs font-mono text-green-400 font-black bg-black/60 px-5 py-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
                            CH: {content.length} | W: {content.split(/\s+/).filter(x => x).length}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <motion.div 
                        className={`p-10 border-2 rounded-[3rem] backdrop-blur-3xl transition-all duration-700 h-full ${
                            analysis ? 'bg-purple/10 border-purple/30 shadow-[0_0_50px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/5 opacity-40'
                        }`}
                    >
                        <h3 className="flex items-center gap-4 font-black text-purple mb-8 uppercase tracking-[0.3em] text-xs">
                            <Sparkles size={20} /> Sugerencias de IA
                        </h3>
                        <div className="space-y-6">
                            {analysis ? (
                                <>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-sm text-gray-200 leading-relaxed shadow-inner">
                                        <span className="text-purple font-black block mb-2 tracking-widest text-[10px]">RECOMENDACIÓN TÉCNICA:</span>
                                        {analysis.recommendations}
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-sm text-gray-200 leading-relaxed shadow-inner">
                                        <span className="text-purple font-black block mb-2 tracking-widest text-[10px]">TENDENCIA POLÍTICA:</span>
                                        Predominancia: <span className="uppercase text-white font-black bg-purple/40 px-2 py-0.5 rounded-lg">{analysis.political_slant}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <BookOpen size={40} className="text-gray-700" />
                                    <p className="text-xs text-gray-600 leading-relaxed uppercase tracking-widest font-bold">
                                        Esperando texto para<br/>auditoría normativa...
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* MIDDLE ROW: The Three Impact Pillars (Horizontal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {/* Column 1: Bias & Alternatives */}
                <motion.div 
                    className={`p-10 border-2 rounded-[3rem] transition-all duration-700 ${
                        analysis?.status === 'FAIL' ? 'bg-red-500/10 border-red-500/40' : 
                        analysis?.status === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/40' :
                        analysis?.status === 'PASS' ? 'bg-green-500/10 border-green-500/40' :
                        'bg-white/5 border-white/5 opacity-40'
                    }`}
                >
                    <h3 className={`flex items-center gap-4 font-black mb-8 uppercase tracking-[0.3em] text-xs ${
                        analysis?.status === 'FAIL' ? 'text-red-500' : 
                        analysis?.status === 'WARNING' ? 'text-yellow-500' :
                        analysis?.status === 'PASS' ? 'text-green-500' : 'text-gray-600'
                    }`}>
                        {analysis?.status === 'FAIL' ? <AlertTriangle size={20} /> : <ShieldAlert size={20} />}
                        Estado de Sesgo
                    </h3>
                    
                    {analysis ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-5xl font-black text-white">{(analysis.bias_score * 100).toFixed(0)}%</span>
                                {analysis.status === 'PASS' && <CheckCircle2 className="text-green-400" size={32} />}
                            </div>
                            
                            <AnimatePresence>
                                {analysis.status !== 'PASS' && analysis.alternatives && analysis.alternatives
                                    .filter((alt: any) => {
                                        const normContent = content.replace(/\s+/g, ' ').trim().toLowerCase();
                                        const normAlt = alt.text.replace(/\s+/g, ' ').trim().toLowerCase();
                                        return !normContent.includes(normAlt);
                                    })
                                    .slice(0, 1).map((alt: any, idx: number) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-6 border-t border-white/10 space-y-4"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-green-400 font-black text-[10px] tracking-widest uppercase">Alternativa Superadora</span>
                                            <span className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-lg">VERIFICADO_MOD</span>
                                        </div>
                                        
                                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-black/40 p-4 rounded-2xl border border-white/5">
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                <span className="block text-[9px] text-gray-600 font-black mb-2 uppercase tracking-tighter">Propuesta de Cambio:</span>
                                                <span className="bg-green-500/10 text-green-300 border-l-2 border-green-500 pl-3 block py-2 rounded-r-lg italic">
                                                    "{alt.text}"
                                                </span>
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Razón Técnica:</p>
                                            <p className="text-xs text-gray-400 leading-tight">{alt.rationale}</p>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                setContent(alt.text);
                                                // Limpiamos las alternativas localmente para evitar el parpadeo
                                                setAnalysis({ ...analysis, alternatives: [], status: 'PASS', bias_score: 0 });
                                            }}
                                            className="w-full py-4 bg-linear-to-r from-green-600 to-green-400 text-black text-xs font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                                        >
                                            Integrar Cambios
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center opacity-20">
                            <ShieldAlert size={40} />
                        </div>
                    )}
                </motion.div>

                {/* Column 2: Comparative Analysis */}
                <motion.div 
                    className={`p-10 border-2 rounded-[3rem] transition-all duration-700 ${
                        analysis ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-40'
                    }`}
                >
                    <h3 className="flex items-center gap-4 font-black text-blue-400 mb-8 uppercase tracking-[0.3em] text-xs">
                        <Scale size={20} /> Comparativa
                    </h3>
                    {analysis?.comparative ? (
                        <div className="space-y-6">
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group hover:border-blue-500/40 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <span className="text-blue-400 font-black text-[10px] tracking-widest uppercase">Nacional</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{analysis.comparative.national || "Sin datos."}</p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group hover:border-blue-500/40 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                                    <span className="text-blue-400 font-black text-[10px] tracking-widest uppercase">Internacional</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{analysis.comparative.international || "Sin datos."}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center opacity-20">
                            <BookOpen size={40} className="text-blue-500" />
                        </div>
                    )}
                </motion.div>

                {/* Column 3: Spirit & Education */}
                <motion.div 
                    className={`p-10 border-2 rounded-[3rem] transition-all duration-700 ${
                        analysis ? 'bg-purple/10 border-purple/30' : 'bg-white/5 border-white/5 opacity-40'
                    }`}
                >
                    <h3 className="flex items-center gap-4 font-black text-purple mb-8 uppercase tracking-[0.3em] text-xs">
                        <Cpu size={20} /> Espíritu AI
                    </h3>
                    {analysis?.legislative_spirit ? (
                        <div className="space-y-6">
                            <div className="relative">
                                <span className="absolute -left-4 top-0 text-3xl text-purple opacity-20 font-serif">“</span>
                                <p className="text-sm text-gray-200 leading-relaxed italic font-serif pl-2">{analysis.legislative_spirit.intent}</p>
                                <span className="absolute -right-2 bottom-0 text-3xl text-purple opacity-20 font-serif">”</span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <span className="text-purple font-black text-[10px] tracking-widest uppercase block mb-4">Técnica Legislativa Avanzada</span>
                                <div className="space-y-4">
                                    {analysis.legislative_spirit.suggestions?.map((s: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-xs text-gray-400 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-purple/30 transition-colors">
                                            <ChevronRight size={14} className="shrink-0 mt-0.5 text-purple" /> {s}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center opacity-20">
                            <Sparkles size={40} className="text-purple" />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* BOTTOM ROW: Education Cards & Security Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {eduCards.map((card, i) => (
                        <motion.div
                            onMouseEnter={() => setHoveredCard(i)}
                            onMouseLeave={() => setHoveredCard(null)}
                            key={i}
                            className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-help relative overflow-hidden ${card.color} ${hoveredCard === i ? 'scale-[1.02] border-white/20 shadow-2xl' : 'scale-100 opacity-60'}`}
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className={`p-3 rounded-2xl bg-white/5 ${card.accent}`}>
                                    {card.icon}
                                </div>
                                <h4 className="font-black text-white text-xs uppercase tracking-[0.2em]">{card.title}</h4>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
                            
                            <AnimatePresence>
                                {hoveredCard === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 border-t border-white/10 pt-4 mt-4"
                                    >
                                        <p className="text-xs text-gray-500 italic">{card.detail}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                <div className="p-12 bg-linear-to-br from-[#020512] to-purple/20 border-2 border-purple/30 rounded-[3rem] flex flex-col items-center justify-center text-center group hover:border-purple/60 transition-all duration-500 shadow-2xl">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-purple mb-6 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                        <ShieldCheck size={32} />
                    </div>
                    <h4 className="font-title font-black text-white text-lg mb-2 tracking-tight uppercase">Seguridad Jurídica</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-[0.2em]">
                        WFD Dir 1.4 Compliant<br/>Audit Agent Active
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DraftingPage;
