// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     GovernancePage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-04-29
 * @summary    Panel de control de Gobernanza Neural con métricas en tiempo real y gestión HITL.
 */

import { API_BASE } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Zap, AlertTriangle, Fingerprint, TrendingUp, Activity, FolderOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import HITLQueue from '../components/HITLQueue';

const COLORS = ['#00E5FF', '#FF0055', '#7C4DFF', '#FFC107'];

const GovernancePage = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const [metrics, setMetrics] = useState<any>(null);
    const [trend, setTrend] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [metricsRes, trendRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/metrics/summary?tenant_id=${user?.tenant_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/v1/metrics/trend?tenant_id=${user?.tenant_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            const metricsData = await metricsRes.json();
            const trendData = await trendRes.json();
            
            setMetrics(metricsData);
            setTrend(trendData);
        } catch (error) {
            console.error("Error fetching governance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return (
        <div className="h-full flex items-center justify-center">
            <Activity className="animate-spin text-cian" size={48} />
        </div>
    );

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-6xl font-black font-title mb-4 tracking-tighter">
                        Gobernanza <span className="text-linear-to-r from-cian to-blue bg-clip-text text-transparent">Neural</span>
                    </h1>
                    <p className="text-gray-400 font-light max-w-2xl text-lg">
                        Monitoreo soberano de integridad, sesgo y cumplimiento normativo en tiempo real.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nodo Auditor Activo</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Indice de Transparencia', value: (metrics?.transparency_index * 100).toFixed(1) + '%', icon: <ShieldCheck className="text-cian" />, trend: 'Auditado' },
                    { label: 'Documentos Totales', value: metrics?.total_documents || 0, icon: <FolderOpen className="text-purple" />, trend: 'Soberanos' },
                    { label: 'Fragmentos Indexados', value: metrics?.total_chunks || 0, icon: <Layers className="text-blue" />, trend: 'Vectorizados' },
                    { label: 'Revisiones HITL', value: metrics?.pending_hitl || 0, icon: <AlertTriangle className="text-red" />, trend: 'Pendientes' },
                ].map((s, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-[#050A1E] border border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                            {s.icon}
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black mb-2 block">{s.label}</span>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black font-title tracking-tighter text-white">{s.value}</span>
                            <span className="text-[10px] font-bold text-cian mb-2">{s.trend}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Volume Trend Chart */}
                <div className="lg:col-span-2 p-10 bg-[#050A1E] border border-white/5 rounded-[3rem]">
                    <h3 className="text-xl font-bold font-title mb-8 flex items-center gap-3">
                        <TrendingUp size={20} className="text-cian" />
                        Flujo de Consultas Legislativas
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#444" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '15px' }}
                                    itemStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="queries" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Impact Distribution Pie */}
                <div className="p-10 bg-[#050A1E] border border-white/5 rounded-[3rem] flex flex-col">
                    <h3 className="text-xl font-bold font-title mb-8 flex items-center gap-3">
                        <Fingerprint size={20} className="text-purple" />
                        Distribución de Impacto
                    </h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics?.impact_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {metrics?.impact_distribution?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {metrics?.impact_distribution?.map((d: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HITL Queue Section */}
            <div className="pt-12 border-t border-white/5">
                <HITLQueue />
            </div>
        </div>
    );
};

export default GovernancePage;
