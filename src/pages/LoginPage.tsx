/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     LoginPage.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @summary    Interfaz de acceso premium con validación JWT.
 */

import { API_BASE } from '../lib/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', email); // OAuth2 expect username
            formData.append('password', password);

            const response = await fetch(API_BASE + '/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Fallo en la autenticación');
            }

            const data = await response.json();
            
            // Obtener perfil detallado
            const profileRes = await fetch(API_BASE + '/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            const userData = await profileRes.json();

            login(data.access_token, userData);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-dark to-dark">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-linear-to-br from-accent to-blue rounded-2xl flex items-center justify-center font-title font-black text-dark text-3xl mx-auto mb-6">L</div>
                    <h1 className="text-3xl font-black font-title tracking-tight mb-2">Lex<span className="text-accent">IA</span></h1>
                    <p className="text-gray-400 font-light text-sm uppercase tracking-widest">Sovereign Intel Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red/10 border border-red/20 text-red text-xs rounded-xl flex items-center gap-3">
                            <ShieldAlert size={16} /> {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Corporativo"
                                className="w-full bg-dark/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/40 transition-all outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                className="w-full bg-dark/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/40 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-accent text-dark font-black rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'INICIAR SESIÓN'}
                    </button>
                </form>

                <p className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    © 2026 FlowState AI - All Rights Reserved
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
