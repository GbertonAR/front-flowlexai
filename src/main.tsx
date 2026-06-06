// ## 🛠 PROTOCOLO DE IDENTIDAD .JS / .TS
/**
 * @system     FlowState AI
 * @brand      Dinamismo y Flujo 
 * @module     main.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-03-07
 * @summary    Punto de entrada React con StrictMode habilitado. Estilos base inyectados.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import { AuthProvider } from './context/AuthContext'

// Interceptor global de fetch para inyectar VITE_API_BASE_URL en producción (Cloud Run)
// @ts-ignore
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
if (apiBaseUrl) {
    const originalFetch = window.fetch;
    // @ts-ignore
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        let targetInput = input;
        if (typeof input === 'string' && input.startsWith('/api/')) {
            targetInput = `${apiBaseUrl}${input}`;
        } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
            targetInput = new URL(`${apiBaseUrl}${input.pathname}${input.search}`);
        } else if (input instanceof Request && input.url.startsWith('/api/')) {
            const newRequest = new Request(`${apiBaseUrl}${input.url}`, input);
            return originalFetch(newRequest, init);
        }
        return originalFetch(targetInput, init);
    };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
