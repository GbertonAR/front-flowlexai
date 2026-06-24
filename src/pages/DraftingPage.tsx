/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo
 * @module     DraftingPage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-05-06
 * @summary    Wizard legislativo v2: Problema → Análisis normativo → Borrador → Exportar.
 *             Modo secundario: auditoría de texto existente (editor libre + análisis de sesgo).
 */

import { API_BASE } from '../lib/api';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertTriangle,
  Copy, Download, RotateCcw, Sparkles, Scale, ShieldCheck,
  BookOpen, ChevronRight, Upload, Save, ShieldAlert, Cpu,
  FileText, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import XAICard from '../components/XAICard';

// ── Tipos ──────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4;
type PageMode   = 'wizard' | 'audit';

interface ClassificationResult {
  recomendacion: 'A' | 'B' | 'C' | 'D';
  recomendacion_titulo: string;
  justificacion: string;
  competencia: string;
  normas_citadas: string[];
  norma_a_modificar: string | null;
  urgencia: string;
  riesgo_juridico: string;
  alternativa: string | null;
  alternativa_razon: string | null;
  nivel1_existe_norma: boolean;
  nivel1_razon: string;
  nivel3_requiere_ley: boolean;
  fuentes_recuperadas: number;
  xai_card: Record<string, unknown>;
  disclaimer: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

const AREAS = [
  'Salud', 'Educación', 'Trabajo', 'Economía', 'Seguridad',
  'Medioambiente', 'Justicia', 'Infraestructura', 'Tecnología', 'Vivienda', 'Otro',
];

const LOADING_STEPS = [
  'Recuperando normas del corpus legislativo...',
  'Evaluando jerarquía constitucional (Arts. 31 y 75 CN)...',
  'Determinando instrumento normativo óptimo...',
  'Generando tarjeta de explicabilidad XAI...',
];

const INSTRUMENT_META: Record<string, { label: string; color: string; badge: string; desc: string }> = {
  A: { label: 'Nueva Ley',        color: 'from-blue to-cian',              badge: 'bg-blue/20 text-cian border-cian/30',     desc: 'Requiere proceso legislativo completo' },
  B: { label: 'Modificación',     color: 'from-purple to-accent',          badge: 'bg-purple/20 text-accent border-accent/30', desc: 'Ajustar norma vigente identificada' },
  C: { label: 'Decreto/Resolución', color: 'from-orange-500 to-amber-400', badge: 'bg-orange-500/20 text-amber-300 border-orange-500/30', desc: 'Vía ejecutiva sin trámite legislativo' },
  D: { label: 'Procedimiento Adm.', color: 'from-green-600 to-teal-400',   badge: 'bg-green-600/20 text-teal-300 border-teal-400/30',     desc: 'Cambio interno sin instrumento normativo' },
};

const URGENCIA_COLOR: Record<string, string> = {
  Alta: 'text-red',
  Media: 'text-amber-400',
  Baja: 'text-green-400',
};

const RIESGO_COLOR: Record<string, string> = {
  Alto: 'text-red',
  Medio: 'text-amber-400',
  Bajo: 'text-green-400',
};

// ── Helpers de animación ───────────────────────────────────────────────────────

const fadeSlide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ── Sub-componentes ────────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: WizardStep }> = ({ current }) => {
  const steps = ['Problema', 'Análisis', 'Borrador', 'Exportar'];
  return (
    <div className="flex items-center gap-0 w-full max-w-xl mx-auto mb-10">
      {steps.map((label, i) => {
        const n = (i + 1) as WizardStep;
        const done   = current > n;
        const active = current === n;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                done   ? 'bg-accent border-accent text-dark' :
                active ? 'bg-purple border-purple text-white shadow-[0_0_16px_rgba(106,27,154,0.5)]' :
                         'bg-white/5 border-white/10 text-gray-600'
              }`}>
                {done ? <CheckCircle2 size={16} /> : n}
              </div>
              <span className={`text-[9px] uppercase tracking-widest font-black mt-1.5 ${active ? 'text-white' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 transition-all ${done ? 'bg-accent' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const InstrumentBadge: React.FC<{ rec: string }> = ({ rec }) => {
  const meta = INSTRUMENT_META[rec];
  if (!meta) return null;
  return (
    <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest ${meta.badge}`}>
      <span className="text-xl font-black">{rec}</span>
      <span>{meta.label}</span>
    </div>
  );
};

// ── Paso 1 — Descripción del problema ─────────────────────────────────────────

interface Step1Props {
  description: string;
  area: string;
  onDescChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onNext: () => void;
  onFileLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExtracting: boolean;
}

const Step1Problem: React.FC<Step1Props> = ({
  description, area, onDescChange, onAreaChange, onNext, onFileLoad, isExtracting,
}) => (
  <motion.div key="step1" {...fadeSlide} className="space-y-8">
    <div>
      <h2 className="text-2xl font-black text-white mb-1 tracking-tight">¿Qué problema querés resolver?</h2>
      <p className="text-sm text-gray-500">Describí la situación o necesidad. Usá lenguaje natural — LexIA se encarga del resto.</p>
    </div>

    <textarea
      value={description}
      onChange={e => onDescChange(e.target.value)}
      placeholder="Ej: Los ciudadanos no tienen acceso a información sobre el uso de fondos públicos municipales. Necesitamos un mecanismo de transparencia obligatorio..."
      rows={7}
      className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-base text-gray-200 focus:outline-none focus:border-purple/50 resize-none placeholder:text-gray-700 leading-relaxed transition-colors"
    />

    <div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Área temática</p>
      <div className="flex flex-wrap gap-2">
        {AREAS.map(a => (
          <button
            key={a}
            onClick={() => onAreaChange(area === a ? '' : a)}
            className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
              area === a
                ? 'bg-purple/30 border-purple text-white shadow-[0_0_12px_rgba(106,27,154,0.4)]'
                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 pt-2">
      <label className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest cursor-pointer hover:border-white/20 transition-all">
        {isExtracting ? <Loader2 className="animate-spin text-accent" size={16} /> : <Upload size={16} />}
        Cargar texto existente (PDF/DOCX)
        <input type="file" className="hidden" accept=".pdf,.docx" onChange={onFileLoad} disabled={isExtracting} />
      </label>

      <button
        onClick={onNext}
        disabled={description.trim().length < 20}
        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          enabled:bg-gradient-to-r enabled:from-purple enabled:to-accent enabled:text-dark enabled:shadow-[0_0_30px_rgba(106,27,154,0.4)] enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
      >
        Analizar contexto normativo <ArrowRight size={18} />
      </button>
    </div>

    <p className="text-[10px] text-gray-700 leading-relaxed">
      Mínimo 20 caracteres. El análisis recupera normas del corpus legislativo indexado — sin inventar citas.
    </p>
  </motion.div>
);

// ── Paso 2 — Análisis normativo ────────────────────────────────────────────────

interface Step2Props {
  isLoading: boolean;
  loadingStepIdx: number;
  result: ClassificationResult | null;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}

const Step2Analysis: React.FC<Step2Props> = ({ isLoading, loadingStepIdx, result, error, onNext, onBack }) => {
  const meta = result ? INSTRUMENT_META[result.recomendacion] : null;

  return (
    <motion.div key="step2" {...fadeSlide} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Análisis normativo</h2>
          <p className="text-sm text-gray-500">LexIA consultó el corpus y determinó el instrumento más adecuado.</p>
        </div>
        {!isLoading && (
          <button onClick={onBack} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Volver
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple/20 border-2 border-purple/40 flex items-center justify-center shadow-[0_0_30px_rgba(106,27,154,0.3)]">
              <Loader2 className="animate-spin text-purple" size={28} />
            </div>
            <p className="text-sm font-black text-purple uppercase tracking-widest">Procesando...</p>
          </div>
          <div className="space-y-3 max-w-md mx-auto">
            {LOADING_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs transition-all duration-500 ${
                i < loadingStepIdx  ? 'text-accent' :
                i === loadingStepIdx ? 'text-white' : 'text-gray-700'
              }`}>
                {i < loadingStepIdx
                  ? <CheckCircle2 size={14} className="shrink-0" />
                  : i === loadingStepIdx
                  ? <Loader2 size={14} className="animate-spin shrink-0" />
                  : <div className="w-3.5 h-3.5 rounded-full border border-gray-700 shrink-0" />
                }
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="p-6 rounded-3xl bg-red/10 border border-red/30 flex items-start gap-4">
          <AlertTriangle className="text-red shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-black text-red mb-1">Error en la clasificación</p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && !isLoading && meta && (
        <div className="space-y-6">

          {/* Card principal */}
          <div className={`p-8 rounded-[2rem] bg-gradient-to-br ${meta.color} bg-opacity-10 border border-white/10`}
               style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3">Instrumento recomendado</p>
                <InstrumentBadge rec={result.recomendacion} />
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Urgencia</p>
                  <p className={`text-sm font-black ${URGENCIA_COLOR[result.urgencia] ?? 'text-white'}`}>{result.urgencia}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Riesgo jurídico</p>
                  <p className={`text-sm font-black ${RIESGO_COLOR[result.riesgo_juridico] ?? 'text-white'}`}>{result.riesgo_juridico}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed mb-6">{result.justificacion}</p>

            {/* Detalles del árbol */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">Nivel 1 — Norma existente</p>
                <p className={`text-xs font-black mb-1 ${result.nivel1_existe_norma ? 'text-amber-400' : 'text-green-400'}`}>
                  {result.nivel1_existe_norma ? 'Existe' : 'No existe'}
                </p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{result.nivel1_razon}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">Nivel 2 — Competencia</p>
                <p className="text-xs font-black text-accent mb-1">{result.competencia}</p>
                <p className="text-[10px] text-gray-500">Arts. 75 / 121-128 CN</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">Nivel 3 — Rango</p>
                <p className={`text-xs font-black mb-1 ${result.nivel3_requiere_ley ? 'text-purple' : 'text-teal-400'}`}>
                  {result.nivel3_requiere_ley ? 'Requiere ley' : 'Decreto/Adm. suficiente'}
                </p>
                <p className="text-[10px] text-gray-500">Art. 76 + 99 CN</p>
              </div>
            </div>
          </div>

          {/* Normas citadas */}
          {result.normas_citadas.length > 0 && result.normas_citadas[0] !== 'Sin antecedentes en corpus' && (
            <div className="p-6 rounded-[2rem] bg-white/3 border border-white/8">
              <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-3 font-black">Normas del corpus aplicables</p>
              <div className="flex flex-wrap gap-2">
                {result.normas_citadas.map((n, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono">
                    {n}
                  </span>
                ))}
              </div>
              {result.norma_a_modificar && (
                <p className="mt-3 text-xs text-amber-400 font-black">
                  Norma a modificar: <span className="text-white">{result.norma_a_modificar}</span>
                </p>
              )}
            </div>
          )}

          {/* Alternativa */}
          {result.alternativa && (
            <div className="p-5 rounded-[2rem] bg-white/3 border border-white/8">
              <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2 font-black">Alternativa viable</p>
              <div className="flex items-center gap-3">
                <InstrumentBadge rec={result.alternativa} />
                <p className="text-xs text-gray-400">{result.alternativa_razon}</p>
              </div>
            </div>
          )}

          {/* XAI */}
          {result.xai_card && Object.keys(result.xai_card).length > 0 && (
            <XAICard data={result.xai_card as any} />
          )}

          {/* Fuentes */}
          <p className="text-[10px] text-gray-700">
            Corpus consultado: {result.fuentes_recuperadas} fragmentos legislativos indexados.
          </p>

          {/* Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-500/80 leading-relaxed">{result.disclaimer}</p>
          </div>

          {/* Fuentes recuperadas = 0 warning */}
          {result.fuentes_recuperadas === 0 && (
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
              <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-400 leading-relaxed">
                No se encontraron normas en el corpus para este tema. El análisis se basó exclusivamente en el marco constitucional general. Ingresá documentos legislativos en la sección Documentos para mejorar la precisión.
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4 pt-2">
            <button onClick={onBack} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 font-black uppercase tracking-widest hover:border-white/20 transition-all">
              <ArrowLeft size={14} /> Volver
            </button>
            <button
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                bg-gradient-to-r from-purple to-accent text-dark
                shadow-[0_0_30px_rgba(106,27,154,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Generar borrador <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Paso 3 — Borrador ──────────────────────────────────────────────────────────

interface Step3Props {
  draft: string;
  isDrafting: boolean;
  classification: ClassificationResult | null;
  biasAnalysis: any;
  isAnalyzing: boolean;
  onDraftChange: (v: string) => void;
  onAnalyzeBias: () => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3Draft: React.FC<Step3Props> = ({
  draft, isDrafting, classification, biasAnalysis, isAnalyzing,
  onDraftChange, onAnalyzeBias, onNext, onBack,
}) => (
  <motion.div key="step3" {...fadeSlide} className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Borrador generado</h2>
        <p className="text-sm text-gray-500">Editá el texto directamente. Luego auditá su sesgo o exportá.</p>
      </div>
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors font-bold uppercase tracking-widest">
        <ArrowLeft size={14} /> Volver
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Editor */}
      <div className="lg:col-span-2">
        <div className="bg-[#020512] border-2 border-white/10 rounded-[2.5rem] overflow-hidden relative">
          <div className="px-8 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[10px] font-mono text-white uppercase tracking-[0.3em] font-black">
              Editor Soberano · <span className="text-green-400">Audit_Mode_Active</span>
            </span>
          </div>

          {isDrafting ? (
            <div className="h-[520px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-purple" size={32} />
              <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Generando articulado...</p>
            </div>
          ) : (
            <textarea
              value={draft}
              onChange={e => onDraftChange(e.target.value)}
              className="w-full h-[520px] bg-transparent p-10 text-base leading-relaxed text-gray-200 focus:outline-none resize-none font-serif placeholder:text-gray-800 selection:bg-purple/40"
              placeholder="El borrador aparecerá aquí..."
            />
          )}

          {!isDrafting && (
            <div className="absolute bottom-6 right-8 text-[10px] font-mono text-green-400 bg-black/60 px-4 py-1.5 rounded-xl border border-white/10">
              {draft.length} ch · {draft.split(/\s+/).filter(Boolean).length} palabras
            </div>
          )}
        </div>
      </div>

      {/* Panel lateral */}
      <div className="space-y-4">

        {/* Resumen de clasificación */}
        {classification && (
          <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Instrumento seleccionado</p>
            <InstrumentBadge rec={classification.recomendacion} />
            <p className="text-[10px] text-gray-500 leading-relaxed">{classification.recomendacion_titulo}</p>
            {classification.norma_a_modificar && (
              <p className="text-[10px] text-amber-400 border-l-2 border-amber-500 pl-3">
                Modifica: {classification.norma_a_modificar}
              </p>
            )}
          </div>
        )}

        {/* Auditoría de sesgo */}
        <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
          biasAnalysis ? 'bg-purple/10 border-purple/30' : 'bg-white/5 border-white/10'
        }`}>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4">Auditoría de sesgo</p>

          {biasAnalysis ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-white">
                  {((biasAnalysis.bias_score as number) * 100).toFixed(0)}%
                </span>
                {biasAnalysis.status === 'PASS'
                  ? <CheckCircle2 className="text-green-400" size={24} />
                  : <AlertTriangle className="text-amber-400" size={24} />
                }
              </div>
              {biasAnalysis.recommendations && (
                <p className="text-[10px] text-gray-400 leading-relaxed border-l-2 border-purple pl-3">
                  {biasAnalysis.recommendations as string}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={onAnalyzeBias}
              disabled={isAnalyzing || !draft.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-purple/40 text-purple hover:bg-purple/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              Auditar sesgo
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="flex gap-4">
      <button onClick={onBack} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 font-black uppercase tracking-widest hover:border-white/20 transition-all">
        <ArrowLeft size={14} /> Volver
      </button>
      <button
        onClick={onNext}
        disabled={!draft.trim()}
        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest
          bg-gradient-to-r from-purple to-accent text-dark
          shadow-[0_0_30px_rgba(106,27,154,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Exportar borrador <ArrowRight size={18} />
      </button>
    </div>
  </motion.div>
);

// ── Paso 4 — Exportar ──────────────────────────────────────────────────────────

interface Step4Props {
  draft: string;
  classification: ClassificationResult | null;
  onRestart: () => void;
  onBack: () => void;
}

const Step4Export: React.FC<Step4Props> = ({ draft, classification, onRestart, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [draft]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borrador_legislativo_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [draft]);

  return (
    <motion.div key="step4" {...fadeSlide} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Exportar borrador</h2>
          <p className="text-sm text-gray-500">Copiá o descargá el texto generado.</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> Volver
        </button>
      </div>

      {/* Preview */}
      <div className="bg-[#020512] border-2 border-white/10 rounded-[2rem] p-8 max-h-72 overflow-y-auto">
        <pre className="text-sm text-gray-300 font-serif whitespace-pre-wrap leading-relaxed">{draft}</pre>
      </div>

      {/* Stats */}
      {classification && (
        <div className="flex flex-wrap gap-6 text-center">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Instrumento</p>
            <InstrumentBadge rec={classification.recomendacion} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Caracteres</p>
            <p className="text-xl font-black text-white">{draft.length.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">Palabras</p>
            <p className="text-xl font-black text-white">{draft.split(/\s+/).filter(Boolean).length.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-accent/30 bg-accent/10 text-accent font-black text-sm uppercase tracking-widest hover:bg-accent/20 transition-all"
        >
          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          {copied ? 'Copiado' : 'Copiar al portapapeles'}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-white/10 bg-white/5 text-gray-300 font-black text-sm uppercase tracking-widest hover:border-white/20 transition-all"
        >
          <Download size={18} /> Descargar .txt
        </button>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-500/80 leading-relaxed">
          {classification?.disclaimer ?? 'Este borrador fue asistido por IA. Debe ser validado por profesionales del derecho antes de cualquier uso formal.'}
        </p>
      </div>

      {/* Reiniciar */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest hover:border-purple/30 hover:text-purple transition-all"
        >
          <RotateCcw size={14} /> Nuevo proyecto
        </button>
      </div>
    </motion.div>
  );
};

// ── Modo Auditoría (editor libre existente) ────────────────────────────────────

interface AuditModeProps {
  token: string | null;
}

const AuditMode: React.FC<AuditModeProps> = ({ token }) => {
  const [content, setContent]       = useState('');
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [isExtracting, setExtracting] = useState(false);
  const [analysis, setAnalysis]     = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch(API_BASE + '/api/v1/drafting/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: content }),
      });
      if (!res.ok) throw new Error('Error en el análisis');
      setAnalysis(await res.json());
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(API_BASE + '/api/v1/drafting/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Error en la extracción');
      const data = await res.json();
      setContent(data.text);
      setAnalysis(null);
    } catch (e) { console.error(e); }
    finally { setExtracting(false); }
  };

  const statusColor = analysis?.status === 'PASS'
    ? 'text-green-400 border-green-400/30 bg-green-400/10'
    : analysis?.status === 'WARNING'
    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 justify-end">
        <label className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest cursor-pointer hover:border-white/20 transition-all flex items-center gap-2">
          {isExtracting ? <Loader2 className="animate-spin text-accent" size={14} /> : <Upload size={14} />}
          Cargar PDF/DOCX
          <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileLoad} disabled={isExtracting} />
        </label>
        <button className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest hover:border-white/20 transition-all flex items-center gap-2">
          <Save size={14} /> Guardar
        </button>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !content}
          className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all
            bg-gradient-to-r from-purple to-accent text-dark
            shadow-[0_0_20px_rgba(106,27,154,0.3)] hover:scale-105 active:scale-95
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
          Auditoría completa
        </button>
      </div>

      {/* Editor + Panel de métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#020512] border-2 border-white/10 rounded-[2.5rem] overflow-hidden relative">
            <div className="px-8 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[10px] font-mono text-white uppercase tracking-[0.3em] font-black">
                Editor Soberano v1.2 · <span className="text-green-400">Audit_Mode_Active</span>
              </span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Ingresá o pegá el texto a auditar..."
              className="w-full h-[480px] bg-transparent p-10 text-lg leading-relaxed text-gray-200 focus:outline-none resize-none font-serif placeholder:text-gray-800 selection:bg-purple/40"
            />
            <div className="absolute bottom-6 right-8 text-[10px] font-mono text-green-400 bg-black/60 px-4 py-1.5 rounded-xl border border-white/10">
              {content.length} ch · {content.split(/\s+/).filter(Boolean).length} palabras
            </div>
          </div>
        </div>

        {/* Panel métricas rápidas */}
        <div className={`p-6 border-2 rounded-[2.5rem] transition-all duration-500 ${
          analysis ? 'bg-purple/10 border-purple/30' : 'bg-white/5 border-white/5 opacity-40'
        }`}>
          <h3 className="flex items-center gap-2 font-black text-purple mb-5 uppercase tracking-[0.3em] text-[10px]">
            <Sparkles size={14} /> Métricas de auditoría
          </h3>
          {analysis ? (
            <div className="space-y-4">
              {/* Score + veredicto */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Índice de sesgo</p>
                  <span className="text-4xl font-black text-white">
                    {((analysis.bias_score as number) * 100).toFixed(0)}%
                  </span>
                </div>
                <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                  {analysis.status as string}
                </span>
              </div>

              {/* Recomendación */}
              <p className="text-xs text-gray-300 leading-relaxed border-l-2 border-purple pl-3">
                {analysis.recommendations as string}
              </p>

              {/* Tendencia política */}
              {analysis.political_slant && (
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Tendencia</span>
                  <span className="text-[10px] uppercase text-white font-black bg-purple/30 px-2 py-0.5 rounded-lg">
                    {analysis.political_slant as string}
                  </span>
                </div>
              )}

              {/* Balance de género */}
              {analysis.gender_balance && (
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Género</span>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg ${
                    analysis.gender_balance === 'balanced'
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-amber-400/10 text-amber-400'
                  }`}>
                    {(analysis.gender_balance as string).replace('-', ' ')}
                  </span>
                </div>
              )}

              {/* Sesgos detectados */}
              {Array.isArray(analysis.detected_biases) && analysis.detected_biases.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Sesgos detectados</p>
                  <ul className="space-y-1">
                    {(analysis.detected_biases as string[]).map((bias, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-300">
                        <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                        <span>{bias}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <BookOpen size={36} className="text-gray-700" />
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                Esperando texto para<br />auditoría normativa...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resultados extendidos — visibles solo con análisis */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            {/* Alternativas superadoras */}
            {Array.isArray(analysis.alternatives) && analysis.alternatives.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <h4 className="flex items-center gap-2 font-black text-accent uppercase tracking-[0.2em] text-[10px] mb-5">
                  <Zap size={14} /> Alternativas superadoras
                </h4>
                <div className="space-y-4">
                  {(analysis.alternatives as any[]).map((alt, i) => (
                    <div key={i} className="bg-accent/5 border border-accent/20 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-sm font-black text-accent">{alt.title}</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(alt.text)}
                          className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                          title="Copiar texto alternativo"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed font-serif mb-3 bg-black/20 p-4 rounded-xl">
                        {alt.text}
                      </p>
                      <p className="text-xs text-gray-400 border-l-2 border-accent/40 pl-3 italic">
                        {alt.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparativa legislativa */}
            {analysis.comparative && (analysis.comparative.national || analysis.comparative.international) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.comparative.national && (
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <h4 className="flex items-center gap-2 font-black text-blue uppercase tracking-[0.2em] text-[10px] mb-4">
                      <Scale size={14} /> Marco Nacional
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{analysis.comparative.national as string}</p>
                  </div>
                )}
                {analysis.comparative.international && (
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <h4 className="flex items-center gap-2 font-black text-cian uppercase tracking-[0.2em] text-[10px] mb-4">
                      <BookOpen size={14} /> Marco Internacional
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{analysis.comparative.international as string}</p>
                  </div>
                )}
              </div>
            )}

            {/* Espíritu legislativo */}
            {analysis.legislative_spirit && (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <h4 className="flex items-center gap-2 font-black text-purple uppercase tracking-[0.2em] text-[10px] mb-4">
                  <ShieldCheck size={14} /> Espíritu legislativo
                </h4>
                {analysis.legislative_spirit.intent && (
                  <p className="text-sm text-gray-200 leading-relaxed mb-5 bg-purple/5 border border-purple/20 rounded-xl p-4">
                    {analysis.legislative_spirit.intent as string}
                  </p>
                )}
                {Array.isArray(analysis.legislative_spirit.suggestions) && analysis.legislative_spirit.suggestions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Sugerencias pedagógicas</p>
                    <ul className="space-y-2">
                      {(analysis.legislative_spirit.suggestions as string[]).map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <ChevronRight size={14} className="text-purple mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────

const DraftingPage: React.FC = () => {
  const { token, user } = useAuth();
  const tenantId = user?.tenant_id ?? 1;

  // Modo (wizard | audit)
  const [mode, setMode] = useState<PageMode>('wizard');

  // Estado del wizard
  const [step, setStep]                       = useState<WizardStep>(1);
  const [problemDescription, setDescription]  = useState('');
  const [areaTematica, setArea]               = useState('');
  const [classification, setClassification]   = useState<ClassificationResult | null>(null);
  const [isClassifying, setClassifying]       = useState(false);
  const [classifyError, setClassifyError]     = useState<string | null>(null);
  const [loadingStepIdx, setLoadingStepIdx]   = useState(0);
  const [draft, setDraft]                     = useState('');
  const [isDrafting, setDrafting]             = useState(false);
  const [biasAnalysis, setBiasAnalysis]       = useState<any>(null);
  const [isAnalyzingBias, setAnalyzingBias]   = useState(false);
  const [isExtracting, setExtracting]         = useState(false);

  // Ciclo de loading steps (animación en paso 2)
  useEffect(() => {
    if (!isClassifying) { setLoadingStepIdx(0); return; }
    const id = setInterval(() => {
      setLoadingStepIdx(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(id);
  }, [isClassifying]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClassify = async () => {
    setClassifying(true);
    setClassifyError(null);
    setClassification(null);
    setStep(2);
    try {
      const res = await fetch(API_BASE + '/api/v1/drafting/classify-instrument', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_description: problemDescription, area_tematica: areaTematica, tenant_id: tenantId }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      setClassification(await res.json());
    } catch (e: unknown) {
      setClassifyError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setClassifying(false);
    }
  };

  const handleGenerateDraft = async () => {
    setDrafting(true);
    setBiasAnalysis(null);
    setStep(3);
    try {
      const topic = `${problemDescription}${classification ? ` — ${classification.recomendacion_titulo}` : ''}`;
      const res = await fetch(API_BASE + '/api/v1/drafting/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tenant_id: tenantId }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setDraft(data.draft ?? '');
    } catch (e) { console.error(e); }
    finally { setDrafting(false); }
  };

  const handleAnalyzeBias = async () => {
    if (!draft.trim()) return;
    setAnalyzingBias(true);
    try {
      const res = await fetch(API_BASE + '/api/v1/drafting/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setBiasAnalysis(await res.json());
    } catch (e) { console.error(e); }
    finally { setAnalyzingBias(false); }
  };

  const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(API_BASE + '/api/v1/drafting/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Error en la extracción');
      const data = await res.json();
      setDraft(data.text ?? '');
      setStep(3);
    } catch (e) { console.error(e); }
    finally { setExtracting(false); }
  };

  const handleRestart = () => {
    setStep(1);
    setDescription('');
    setArea('');
    setClassification(null);
    setClassifyError(null);
    setDraft('');
    setBiasAnalysis(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 px-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-6">
        <div>
          <h1 className="text-5xl font-black font-title mb-3 tracking-tighter leading-none">
            Redacción <span className="text-purple">Asistida</span>
          </h1>
          <p className="text-gray-500 text-sm font-light italic">De la idea al proyecto con IA legislativa soberana.</p>
        </div>

        {/* Toggle de modo */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10">
          {(['wizard', 'audit'] as PageMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === m
                  ? 'bg-purple text-white shadow-[0_0_16px_rgba(106,27,154,0.4)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m === 'wizard' ? (
                <span className="flex items-center gap-2"><Zap size={12} /> Crear proyecto</span>
              ) : (
                <span className="flex items-center gap-2"><FileText size={12} /> Auditar texto</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido por modo */}
      <AnimatePresence mode="wait">
        {mode === 'wizard' ? (
          <motion.div key="wizard" {...fadeSlide}>
            <StepIndicator current={step} />
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step1Problem
                  description={problemDescription}
                  area={areaTematica}
                  onDescChange={setDescription}
                  onAreaChange={setArea}
                  onNext={handleClassify}
                  onFileLoad={handleFileLoad}
                  isExtracting={isExtracting}
                />
              )}
              {step === 2 && (
                <Step2Analysis
                  isLoading={isClassifying}
                  loadingStepIdx={loadingStepIdx}
                  result={classification}
                  error={classifyError}
                  onNext={handleGenerateDraft}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3Draft
                  draft={draft}
                  isDrafting={isDrafting}
                  classification={classification}
                  biasAnalysis={biasAnalysis}
                  isAnalyzing={isAnalyzingBias}
                  onDraftChange={setDraft}
                  onAnalyzeBias={handleAnalyzeBias}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <Step4Export
                  draft={draft}
                  classification={classification}
                  onRestart={handleRestart}
                  onBack={() => setStep(3)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="audit" {...fadeSlide}>
            <AuditMode token={token} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DraftingPage;
