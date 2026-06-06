import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AssistantPage from './pages/AssistantPage';
import ComparePage from './pages/ComparePage';
import SearchPage from './pages/SearchPage';
import DocumentsPage from './pages/DocumentsPage';
import GovernancePage from './pages/GovernancePage';
import DraftingPage from './pages/DraftingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="p-20 text-center animate-pulse text-accent">Cargando LexIA Core...</div>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route path="/" element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="assistant" element={<AssistantPage />} />
                            <Route path="compare" element={<ComparePage />} />
                            <Route path="search" element={<SearchPage />} />
                            <Route path="documents" element={<DocumentsPage />} />
                            <Route path="governance" element={<GovernancePage />} />
                            <Route path="drafting" element={<DraftingPage />} />
                            <Route path="analytics" element={<AnalyticsPage />} />
                            <Route path="*" element={<div className="p-10 text-center text-gray-400">Módulo bajo construcción</div>} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
