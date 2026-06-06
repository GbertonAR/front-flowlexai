/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     DocumentEditModal.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @summary    Modal para la edición de metadatos legislativos (Jurisdicción y Jerarquía).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Shield, Gavel } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  onSave: (newName: string, newJuris: string, newJerar: string) => void;
}

const DocumentEditModal: React.FC<EditModalProps> = ({ isOpen, onClose, document, onSave }) => {
  const [jurisdiccion, setJurisdiccion] = useState(document?.jurisdiccion || 'Nacional');
  const [jerarquia, setJerarquia] = useState(document?.jerarquia || 'Ley');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-[#0A0F1E] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-xl font-black font-title">Editar <span className="text-blue">Metadatos</span></h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Shield size={12} /> Jurisdicción
              </label>
              <select 
                value={jurisdiccion}
                onChange={(e) => setJurisdiccion(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:border-blue/50 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="Nacional" className="bg-[#0A0F1E] text-white">Nacional</option>
                <option value="Provincial" className="bg-[#0A0F1E] text-white">Provincial</option>
                <option value="CABA" className="bg-[#0A0F1E] text-white">CABA</option>
                <option value="Municipal" className="bg-[#0A0F1E] text-white">Municipal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Gavel size={12} /> Jerarquía Normativa
              </label>
              <select 
                value={jerarquia}
                onChange={(e) => setJerarquia(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:border-blue/50 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="Constitución" className="bg-[#0A0F1E] text-white">Constitución</option>
                <option value="Tratado Internacional" className="bg-[#0A0F1E] text-white">Tratado Internacional</option>
                <option value="Ley" className="bg-[#0A0F1E] text-white">Ley</option>
                <option value="Decreto" className="bg-[#0A0F1E] text-white">Decreto</option>
                <option value="Resolución" className="bg-[#0A0F1E] text-white">Resolución</option>
                <option value="Ordenanza" className="bg-[#0A0F1E] text-white">Ordenanza</option>
                <option value="Reglamento Interno" className="bg-[#0A0F1E] text-white">Reglamento Interno</option>
              </select>
            </div>

            <div className="p-4 bg-blue/5 border border-blue/20 rounded-2xl">
              <p className="text-[10px] text-blue-300 font-medium leading-relaxed">
                Nota: El cambio se aplicará a todos los fragmentos vectoriales asociados a este documento.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onSave(document.name, jurisdiccion, jerarquia)}
              className="flex-1 px-6 py-4 bg-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Guardar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentEditModal;
