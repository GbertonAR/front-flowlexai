// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     AcademyTour.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-07
 * @summary    Componente de capacitación interactiva para usuarios parlamentarios (WFD Dir 6.2).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, PlayCircle } from 'lucide-react';

const AcademyTour = () => {
    return (
        <div className="p-8 bg-gradient-to-br from-mid/40 to-dark/40 rounded-[2.5rem] border border-accent/10 backdrop-blur-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-accent text-dark">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-title font-black text-white">LexIA <span className="text-accent">Academy</span></h2>
                    <p className="text-gray-500 text-xs">Formación Soberana — Directrices WFD 6.2</p>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { title: "Módulo 1: Ética en IA Legislativa", time: "10 min", icon: <PlayCircle size={16} /> },
                    { title: "Módulo 2: Cómo auditar Tarjetas XAI", time: "8 min", icon: <PlayCircle size={16} /> },
                    { title: "Módulo 3: Protocolo HITL de Supervisión", time: "12 min", icon: <PlayCircle size={16} /> }
                ].map((mod, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-accent">{mod.icon}</span>
                            <span className="text-sm font-medium text-gray-300">{mod.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{mod.time}</span>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                    <Award size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Certificación WFD Practitioner</span>
                </div>
                <span className="text-[10px] text-gray-500 italic">0/3 Completados</span>
            </div>
        </div>
    );
};

export default AcademyTour;
