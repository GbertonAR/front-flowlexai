/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     Home.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Scale, Search, PenTool, FolderOpen, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const Home = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const modules = [
        { id: 1, name: t('common.assistant'), icon: <Scale />, color: 'border-accent', desc: 'Análisis de leyes en tiempo real.', path: '/assistant' },
        { id: 2, name: t('common.search'), icon: <Search />, color: 'border-cian', desc: 'NLP para jurisprudencia compleja.', path: '/search' },
        { id: 3, name: 'Redacción Asistida', icon: <PenTool />, color: 'border-purple', desc: 'Generación de borradores éticos.', path: '/drafting' },
        { id: 4, name: 'Gestión Documental', icon: <FolderOpen />, color: 'border-blue', desc: 'Archivo soberano inmutable.', path: '/documents' },
        { id: 5, name: 'Monitoreo y Control', icon: <Activity />, color: 'border-white', desc: 'Kpis de actividad legislativa.', path: '/analytics' },
        { id: 6, name: 'Ética y Gobernanza', icon: <ShieldCheck />, color: 'border-red', desc: 'Auditoría XAI y transparencia.', path: '/governance' },
    ];

    return (
        <div className="space-y-24">
            {/* Hero Section */}
            <section className="flex flex-col lg:flex-row items-center gap-16 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 text-center lg:text-left"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 mb-8">
                        <span className="text-[10px] uppercase tracking-widest text-accent font-bold">FlowState AI v3.0 SPOC</span>
                    </div>
                    <h2 className="font-title text-6xl lg:text-7xl font-black leading-tight mb-8 tracking-tighter">
                        {t('home.title').split(' ')[0]} <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-accent via-purple to-cian">
                            {t('home.title').split(' ').slice(1).join(' ')}
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mb-12 font-light">
                        {t('home.subtitle')}
                    </p>
                    <button 
                        onClick={() => navigate('/assistant')}
                        className="px-8 py-4 bg-accent text-dark font-black rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                    >
                        {t('home.cta')}
                    </button>
                </motion.div>

                <div className="flex-1 w-full max-w-lg aspect-video relative bg-dark/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-10 hidden lg:flex flex-col justify-center items-center">
                    <div className="text-8xl mb-4">🧬</div>
                    <div className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Neural Core Active</div>
                </div>
            </section>

            {/* Modules Grid */}
            <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {modules.map((m) => (
                    <motion.div
                        key={m.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                        onClick={() => navigate(m.path)}
                        className={`p-10 rounded-3xl border ${m.color}/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all cursor-pointer group shadow-sm`}
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-accent mb-6 group-hover:bg-accent/10">
                            {React.cloneElement(m.icon as React.ReactElement<any>, { size: 24 })}
                        </div>
                        <h3 className="font-title font-black text-lg mb-2 text-white/90">{m.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                    </motion.div>
                ))}
            </motion.section>
        </div>
    );
};

export default Home;
