/**
 * API Service Switcher - Switches between Real API and Mock API at build time
 */

import * as mockApi from './mockApi';
import realApi from './api';

const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';

console.log(`🔧 API: ${USE_MOCK_API ? 'MOCK (client)' : 'REAL (server)'}`);

const safeGetSessionStorage = (key: string): string | null => {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            return sessionStorage.getItem(key);
        }
    } catch (e) {
        console.warn('SessionStorage access failed', e);
    }
    return null;
};

// Helper to get country from sessionStorage
const getCountry = (): 'egypt' | 'libya' => {
    const country = safeGetSessionStorage('selectedCountry');
    return (country as 'egypt' | 'libya') || 'egypt';
};

// Mock API adapter that mimics realApi interface
const mockApiAdapter = {
    async get(url: string, config?: any) {
        try {
            const path = url.replace(/^\//, '');
            const country = getCountry();

            if (path === 'health') return { data: { status: 'ok' } };
            if (path === 'auth/me') return { data: await mockApi.mockGetUserProfile(safeGetSessionStorage('token') || '') };
            if (path === 'projects') return { data: await mockApi.mockGetProjects() };
            if (path.startsWith('projects/')) return { data: await mockApi.mockGetProjectById(path.split('/')[1]) };
            if (path === 'sections') return { data: await mockApi.mockGetSections() };
            if (path.startsWith('sections/')) return { data: await mockApi.mockGetSectionById(path.split('/')[1]) };

            // Critical Resources with additional safety
            if (path === 'employees') {
                try {
                    const data = await mockApi.mockGetEmployees(country);
                    return { data: Array.isArray(data) ? data : [] };
                } catch (err) {
                    console.error('Error fetching employees mock:', err);
                    return { data: [] }; // Fallback to empty array
                }
            }
            if (path.startsWith('employees/')) {
                const id = path.split('/')[1];
                const employees = await mockApi.mockGetEmployees(country);
                const emp = employees.find((e: any) => e.id === id);
                if (!emp) throw new Error('Employee not found');
                return { data: emp };
            }

            if (path === 'payments') {
                try {
                    const data = await mockApi.mockGetPayments(country);
                    return { data: Array.isArray(data) ? data : [] };
                } catch (err) {
                    console.error('Error fetching payments mock:', err);
                    return { data: [] }; // Fallback to empty array
                }
            }
            if (path.startsWith('payments/')) {
                const id = path.split('/')[1];
                const payments = await mockApi.mockGetPayments(country);
                const pay = payments.find((p: any) => p.id === id);
                if (!pay) throw new Error('Payment not found');
                return { data: pay };
            }

            if (path === 'users') return { data: await mockApi.mockGetUsers() };
            if (path.startsWith('reports/')) return { data: await mockApi.mockGetReportData(path.split('/')[1], config?.params || {}) };

            throw new Error(`Mock API GET ${url} not implemented`);
        } catch (error) {
            console.error(`Mock API Error (GET ${url}):`, error);
            throw error; // Re-throw to be handled by caller
        }
    },


    async post(url: string, data?: any) {
        const path = url.replace(/^\//, '');
        const country = getCountry();

        if (path === 'auth/login') {
            const { email, password, country } = data;
            return { data: await mockApi.mockLogin(email, password, country) };
        }
        if (path === 'projects') return { data: await mockApi.mockCreateProject(data) };
        if (path === 'sections') return { data: await mockApi.mockCreateSection(data) };
        if (path === 'employees') return { data: await mockApi.mockCreateEmployee(country, data) };
        if (path === 'payments') return { data: await mockApi.mockCreatePayment(country, data) };

        throw new Error(`Mock API POST ${url} not implemented`);
    },

    async put(url: string, data?: any) {
        const [resource, id] = url.replace(/^\//, '').split('/');
        const country = getCountry();

        if (resource === 'projects') return { data: await mockApi.mockUpdateProject(id, data) };
        if (resource === 'sections') return { data: await mockApi.mockUpdateSection(id, data) };
        if (resource === 'employees') return { data: await mockApi.mockUpdateEmployee(country, id, data) };
        if (resource === 'payments') return { data: await mockApi.mockUpdatePayment(country, id, data) };

        throw new Error(`Mock API PUT ${url} not implemented`);
    },

    async delete(url: string) {
        const [resource, id] = url.replace(/^\//, '').split('/');
        const country = getCountry();

        if (resource === 'projects') {
            await mockApi.mockDeleteProject(id);
            return { data: { success: true } };
        }
        if (resource === 'sections') {
            await mockApi.mockDeleteSection(id);
            return { data: { success: true } };
        }
        if (resource === 'employees') {
            await mockApi.mockDeleteEmployee(country, id);
            return { data: { success: true } };
        }
        if (resource === 'payments') {
            await mockApi.mockDeletePayment(country, id);
            return { data: { success: true } };
        }

        throw new Error(`Mock API DELETE ${url} not implemented`);
    },

    async patch(url: string, data?: any) {
        return mockApiAdapter.put(url, data);
    },

    setAuthToken(token: string) { sessionStorage.setItem('token', token); },
    removeAuthToken() { sessionStorage.removeItem('token'); },
    setCountryHeader(_country: 'egypt' | 'libya') { },
    removeCountryHeader() { },
    instance: null as any,
    defaults: { headers: { common: {} as Record<string, string> } },
    async healthCheck() { return { data: { status: 'ok' } }; }
};

// Export the appropriate service
export default USE_MOCK_API ? mockApiAdapter : realApi;

