/// <reference types="vite/client" />
/**
 * @system     FlowState AI
 * @module     api.ts
 * @summary    Base URL del backend. En Azure Static Web Apps /api/ está reservado
 *             para Functions — todas las llamadas usan la URL absoluta del backend.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
