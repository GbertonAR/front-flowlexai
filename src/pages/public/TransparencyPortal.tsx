// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     TransparencyPortal.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-07
 * @summary    Portal público de divulgación sobre el uso de IA (WFD Dir 6.5).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, FileText, UserCheck, Shield } from 'lucide-react';

const aiInventory = [
    { id: 1, name: 'Asistente Legislativo', purpose: 'Asistir en el resumen de leyes.', hitl: true, data: 'Documentos públicos' },
    { id: 2, name: 'Búsqueda Semántica', purpose: 'Encontrar jurisprudencia relacionada.', hitl: false, data: 'Base de datos legislativa' },
    { id: 3, name: 'Detector de Sesgos', purpose: 'Asegurar equidad técnica.', hitl: true, data: 'Metadatos anónimos' },
];

const TransparencyPortal = () => {
    return (
        <div className="p-8 bg-dark/60 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-title font-black text-white">Portal de <span className="text-accent">Transparencia IA</span></h2>
                    <p className="text-gray-400 text-sm mt-2">Cumplimiento Directriz WFD 6.5 — Información Ciudadana</p>
                </div>
                <Share2 className="text-accent cursor-pointer hover:scale-110 transition-transform" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiInventory.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5"
                    >
                        <h3 className="text-lg font-bold mb-4 text-white/90">{item.name}</h3>
                        <div className="space-y-4 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-accent" />
                                <span>{item.purpose}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCheck size={14} className={item.hitl ? "text-green-400" : "text-yellow-400"} />
                                <span>{item.hitl ? "Revisión Humana Activa" : "Procesamiento Automático"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-purple" />
                                <span>Datos: {item.data}</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 transition-all">
                            Ver Ficha Técnica
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TransparencyPortal;
