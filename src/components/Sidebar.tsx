/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     Sidebar.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-25
 * @summary    Sidebar Premium con navegación reactiva, saludo dinámico y layout resiliente.
 */

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Scale, Search, FolderOpen, 
  Activity, ShieldCheck, User,
  LayoutDashboard, Settings, Moon, Sun, Languages,
  Columns, Download, Menu, X, LogOut, ChevronLeft, ChevronRight, PenTool
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void 
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const menuItems = [
    { path: '/', name: t('common.dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/assistant', name: t('common.assistant'), icon: <Scale size={20} /> },
    { path: '/search', name: t('common.search'), icon: <Search size={20} /> },
    { path: '/drafting', name: 'Redacción Asistida', icon: <PenTool size={20} /> },
    { path: '/compare', name: 'Comparativa', icon: <Columns size={20} /> },
    { path: '/documents', name: 'Documentos', icon: <FolderOpen size={20} /> }, 
    { path: '/governance', name: 'Gobernanza', icon: <ShieldCheck size={20} /> },
    { path: '/analytics', name: 'Métricas', icon: <Activity size={20} /> },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-[100] p-3 rounded-2xl bg-accent text-dark shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        <motion.aside 
          initial={{ x: -280 }}
          animate={{ x: 0, width: isCollapsed ? 80 : 280 }}
          exit={{ x: -280 }}
          className={`fixed left-0 top-0 h-screen bg-dark/40 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col transition-all 
            ${isOpen ? 'flex' : 'hidden lg:flex'} 
            ${isCollapsed ? 'p-4 items-center' : 'p-6'}`}
        >
            {/* Desktop Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex absolute -right-3 top-8 bg-accent text-dark p-1 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Logo */}
            <div className={`flex items-center gap-3 mb-8 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
              <div className="w-10 h-10 shrink-0 rounded-xl bg-linear-to-br from-accent to-blue flex items-center justify-center font-title font-black text-dark text-xl shadow-lg shadow-accent/20">L</div>
              {!isCollapsed && (
                <span className="font-title text-2xl font-black tracking-tight text-white whitespace-nowrap">
                  Lex<span className="text-accent">IA</span>
                </span>
              )}
            </div>

            {/* User Profile Section */}
            {!isCollapsed && user && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent border border-accent/30">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-0.5">{getGreeting()}</p>
                            <p className="text-sm font-black text-white truncate">{user.full_name || 'Usuario'}</p>
                            <p className="text-[10px] text-gray-500 font-medium truncate">{user.role}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation (Scrollable if needed) */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-hide">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center gap-4 py-3 rounded-xl transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                      isActive 
                      ? 'bg-accent/10 text-accent border border-accent/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                  {!isCollapsed && <span className="text-sm font-bold tracking-tight whitespace-nowrap">{item.name}</span>}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Actions (Fixed at bottom) */}
            <div className={`mt-auto space-y-2 pt-6 border-t border-white/5 ${isCollapsed ? 'w-full' : ''}`}>
              {deferredPrompt && (
                <button 
                  onClick={handleInstall}
                  className={`w-full flex items-center gap-4 py-3 rounded-xl bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all font-black ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                  title={isCollapsed ? "Instalar App" : undefined}
                >
                  <Download size={20} />
                  {!isCollapsed && <span className="text-xs uppercase tracking-wider whitespace-nowrap">Instalar App</span>}
                </button>
              )}
              <button 
                onClick={toggleLanguage}
                className={`w-full flex items-center gap-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                title={isCollapsed ? "Idioma" : undefined}
              >
                <Languages size={20} className="text-accent" />
                {!isCollapsed && <span className="text-sm font-bold tracking-tight uppercase whitespace-nowrap">{i18n.language === 'es' ? 'English' : 'Español'}</span>}
              </button>
              <button 
                onClick={toggleTheme}
                className={`w-full flex items-center gap-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                title={isCollapsed ? "Tema" : undefined}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                {!isCollapsed && <span className="text-sm font-bold tracking-tight whitespace-nowrap">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
              </button>
              <NavLink
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }: { isActive: boolean }) => 
                    `flex items-center gap-4 py-3 rounded-xl transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                      isActive ? 'text-accent' : 'text-gray-400 hover:text-white'
                    }`
                  }
                  title={isCollapsed ? t('common.settings') : undefined}
                >
                <Settings size={20} />
                {!isCollapsed && <span className="text-sm font-bold tracking-tight whitespace-nowrap">{t('common.settings')}</span>}
              </NavLink>
              <button 
                onClick={logout}
                className={`w-full flex items-center gap-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                title={isCollapsed ? "Cerrar Sesión" : undefined}
              >
                <LogOut size={20} />
                {!isCollapsed && <span className="text-sm font-bold tracking-tight uppercase whitespace-nowrap">Cerrar Sesión</span>}
              </button>
            </div>
          </motion.aside>
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
export default Sidebar;
