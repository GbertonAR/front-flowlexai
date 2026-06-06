/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     ForensicTerminal.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @summary    Terminal de visualización forense para procesos de ingesta RAG.
 *             Incluye cronómetro, contador de lotes y estética CRT.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ForensicTerminalProps {
  isVisible: boolean;
  filename: string;
  onClose?: () => void; // Propiedad para cerrar la terminal
}

const ForensicTerminal: React.FC<ForensicTerminalProps> = ({ isVisible, filename, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    setLogs([]);
    setTimer(0);
    setIsFinished(false);
    
    const initialMessages = [
      `🌐 [REQ] Iniciando ingesta forense: '${filename}'`,
      `🧠 [WORKFLOW] Cargando búfer binario en memoria LexIA...`,
      `🧬 [AGENT] Analizando estructura semántica (PDF/AKN)...`,
      `✅ [OK] Documento validado. Iniciando mapeo vectorial.`
    ];

    let currentIdx = 0;
    const estimatedBatches = 101;
    
    const logInterval = setInterval(() => {
      if (currentIdx < initialMessages.length) {
        const nextLog = initialMessages[currentIdx];
        if (nextLog) setLogs(prev => [...prev, nextLog]);
        currentIdx++;
      } else if (currentIdx < initialMessages.length + estimatedBatches) {
        const batchNum = currentIdx - initialMessages.length + 1;
        setLogs(prev => [
          ...prev.slice(-15), // Mantenemos los últimos 15 para performance
          `📦 [BATCH] Procesando lote ${batchNum} de ${estimatedBatches}...`
        ]);
        currentIdx++;
      } else {
        setIsFinished(true);
        setLogs(prev => [
          ...prev,
          `✅ [OK] Ingesta completada con éxito.`,
          `🔮 [TIME] Tiempo total: ${formatTime(timer)}`
        ]);
        clearInterval(logInterval);
      }
    }, 100);

    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(logInterval);
      clearInterval(timerInterval);
    };
  }, [isVisible, filename]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-10"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-4xl bg-[#020502] border-2 border-green-500/30 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden"
        >
          {/* CRT Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none z-30 bg-radial-[at_50%_50%] from-transparent via-transparent to-black/40" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Scanlines y Glow */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-20 opacity-30" />
            
            <div className="flex items-center justify-between px-8 py-5 bg-green-500/10 border-b border-green-500/20">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] font-mono text-green-400 uppercase tracking-[0.3em] font-black">LexIA Forensic Core</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="text-green-500/50">ELAPSED_TIME:</span>
                <span className="text-green-400 tabular-nums font-bold">{formatTime(timer)}</span>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="h-[400px] overflow-y-auto p-8 font-mono text-sm text-green-400 scrollbar-hide selection:bg-green-500/30"
            >
              {logs.map((log, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className="mb-1.5 flex gap-4"
                >
                  <span className="text-green-800 font-bold shrink-0">{(i + 1).toString().padStart(3, '0')}</span>
                  <span className={log?.includes('❌') ? 'text-red-400' : log?.includes('✅') ? 'text-blue-400 font-bold' : ''}>
                    {log}
                  </span>
                </motion.div>
              ))}
              {!isFinished && (
                <motion.div 
                  animate={{ opacity: [0, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="w-2 h-4 bg-green-500 inline-block ml-1 align-middle"
                />
              )}
            </div>

            <div className="px-8 py-5 bg-green-500/5 border-t border-green-500/10 flex justify-between items-center text-[10px] font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-green-400 font-black">STATUS: {isFinished ? 'PROCESS_COMPLETE' : 'EXECUTING_VECTOR_MAPPING'}</span>
                <span className="text-green-700">TENANT_ID: 001 // SOBERANÍA_DATOS_OK</span>
              </div>

              {isFinished && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={onClose}
                  className="px-6 py-2 bg-green-500 text-black font-black uppercase tracking-widest rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
                >
                  Cerrar Terminal
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForensicTerminal;
