/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     DocumentsPage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @summary    Explorador Documental Avanzado con CRUD de metadatos soberanos.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FolderOpen, Upload, File, Trash2, CheckCircle, 
  Loader2, Search, Filter, Shield, Gavel, Calendar, Layers, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ForensicTerminal from '../components/ForensicTerminal';
import DocumentEditModal from '../components/DocumentEditModal';

const DocumentsPage = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentFilename, setCurrentFilename] = useState('');
    
    // UI States
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterJurisdiccion, setFilterJurisdiccion] = useState('all');
    const [filterJerarquia, setFilterJerarquia] = useState('all');

    const fetchDocuments = async () => {
        if (!user?.tenant_id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/ingest/list/${user.tenant_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [user?.tenant_id, token]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCurrentFilename(file.name);
        setIsUploading(true);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const startTime = Date.now();
            const response = await fetch(`/api/v1/ingest/pdf?tenant_id=${user?.tenant_id || 999}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const duration = Date.now() - startTime;
            if (duration < 2000) await new Promise(r => setTimeout(r, 2000 - duration));

            if (!response.ok) throw new Error('Error en la carga');
            setUploadSuccess(true);
            fetchDocuments();
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (name: string) => {
        if (!window.confirm(`¿Está seguro de eliminar '${name}'? Esta acción reconstruirá el índice FAISS.`)) return;
        
        try {
            const response = await fetch(`/api/v1/ingest/document/${user?.tenant_id}?source_name=${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchDocuments();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const handleSaveMetadata = async (name: string, juris: string, jerar: string) => {
        try {
            const response = await fetch(`/api/v1/ingest/document/${user?.tenant_id}?source_name=${encodeURIComponent(name)}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jurisdiccion: juris, jerarquia: jerar })
            });
            if (response.ok) {
                setIsEditModalOpen(false);
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesJuris = filterJurisdiccion === 'all' || doc.jurisdiccion === filterJurisdiccion;
        const matchesJerar = filterJerarquia === 'all' || doc.jerarquia === filterJerarquia;
        return matchesSearch && matchesJuris && matchesJerar;
    });

    const jurisdictions = Array.from(new Set(documents.map(d => d.jurisdiccion)));
    const hierarchies = Array.from(new Set(documents.map(d => d.jerarquia)));

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h1 className="text-6xl font-black font-title mb-4 tracking-tighter leading-none">
                        Archivo <span className="text-blue">Soberano</span>
                    </h1>
                    <p className="text-gray-400 font-light max-w-md">Gestión soberana de integridad legislativa.</p>
                </div>
                
                <label className="relative z-10 shrink-0">
                    <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
                    <div className="px-10 py-5 bg-linear-to-br from-blue to-blue-700 text-white font-black rounded-[2rem] shadow-2xl shadow-blue/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 cursor-pointer">
                        {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
                        <span className="tracking-widest uppercase text-sm font-black">Cargar Norma</span>
                    </div>
                </label>
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 bg-dark/20 p-4 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por título..."
                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-blue/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-4">
                    <select 
                        className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-hidden focus:border-blue/50 cursor-pointer"
                        value={filterJurisdiccion}
                        onChange={(e) => setFilterJurisdiccion(e.target.value)}
                    >
                        <option value="all" className="bg-[#050A1E] text-white">Todas las Jurisdicciones</option>
                        {jurisdictions.map(j => <option key={j} value={j} className="bg-[#050A1E] text-white">{j}</option>)}
                    </select>

                    <select 
                        className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-hidden focus:border-blue/50 cursor-pointer"
                        value={filterJerarquia}
                        onChange={(e) => setFilterJerarquia(e.target.value)}
                    >
                        <option value="all" className="bg-[#050A1E] text-white">Todas las Jerarquías</option>
                        {hierarchies.map(h => <option key={h} value={h} className="bg-[#050A1E] text-white">{h}</option>)}
                    </select>
                </div>
            </div>

            {/* Explorador */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Documento</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Jurisdicción</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Jerarquía</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Chunks</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-blue" size={40} /></td></tr>
                            ) : filteredDocs.map((doc, idx) => (
                                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center text-blue shrink-0">
                                                <File size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white/90 truncate max-w-md">{doc.name}</p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-tighter">ID: {doc.doc_hash?.substring(0,8) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-4 py-2 rounded-xl bg-cian/10 text-cian text-[10px] font-black uppercase tracking-widest border border-cian/20">
                                            {doc.jurisdiccion}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Layers size={14} className="text-blue/50" />
                                            <span className="text-xs font-bold text-gray-300">{doc.jerarquia}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center font-mono text-xs text-blue">{doc.chunks}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setSelectedDoc(doc); setIsEditModalOpen(true); }}
                                                className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-cian hover:bg-cian/10 transition-all" 
                                                title="Editar Metadatos"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc.name)}
                                                className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all" 
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedDoc && (
                <DocumentEditModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    document={selectedDoc}
                    onSave={handleSaveMetadata}
                />
            )}

            <ForensicTerminal 
                isVisible={isUploading} 
                filename={currentFilename} 
                onClose={() => setIsUploading(false)}
            />
        </div>
    );
};

export default DocumentsPage;
