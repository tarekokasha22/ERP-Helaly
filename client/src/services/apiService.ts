/**
 * API Service Switcher - Switches between Real API and Mock API at build time
 */

import * as mockApi from './mockApi';
import realApi from './api';

const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';

console.log(`🔧 API: ${USE_MOCK_API ? 'MOCK (client)' : 'REAL (server)'}`);

// Mock API adapter that mimics realApi interface
const mockApiAdapter = {
    async get(url: string, config?: any) {
        const path = url.replace(/^\//, '');

        if (path === 'health') return { data: { status: 'ok' } };
        if (path === 'auth/me') return { data: await mockApi.mockGetUserProfile(sessionStorage.getItem('token') || '') };
        if (path === 'projects') return { data: await mockApi.mockGetProjects() };
        if (path.startsWith('projects/')) return { data: await mockApi.mockGetProjectById(path.split('/')[1]) };
        if (path === 'sections') return { data: await mockApi.mockGetSections() };
        if (path.startsWith('sections/')) return { data: await mockApi.mockGetSectionById(path.split('/')[1]) };
        if (path === 'employees') return { data: await mockApi.mockGetEmployees() };
        if (path.startsWith('employees/')) {
            const id = path.split('/')[1];
            const employees = await mockApi.mockGetEmployees();
            const emp = employees.find((e: any) => e.id === id);
            if (!emp) throw new Error('Employee not found');
            return { data: emp };
        }
        if (path === 'payments') return { data: await mockApi.mockGetPayments() };
        if (path.startsWith('payments/')) {
            const id = path.split('/')[1];
            const payments = await mockApi.mockGetPayments();
            const pay = payments.find((p: any) => p.id === id);
            if (!pay) throw new Error('Payment not found');
            return { data: pay };
        }
        if (path === 'users') return { data: await mockApi.mockGetUsers() };
        if (path.startsWith('reports/')) return { data: await mockApi.mockGetReportData(path.split('/')[1], config?.params || {}) };

        throw new Error(`Mock API GET ${url} not implemented`);
    },

    async post(url: string, data?: any) {
        const path = url.replace(/^\//, '');

        if (path === 'auth/login') {
            const { email, password, country } = data;
            return { data: await mockApi.mockLogin(email, password, country) };
        }
        if (path === 'projects') return { data: await mockApi.mockCreateProject(data) };
        if (path === 'sections') return { data: await mockApi.mockCreateSection(data) };
        if (path === 'employees') return { data: await mockApi.mockCreateEmployee(data) };
        if (path === 'payments') return { data: await mockApi.mockCreatePayment(data) };

        throw new Error(`Mock API POST ${url} not implemented`);
    },

    async put(url: string, data?: any) {
        const [resource, id] = url.replace(/^\//, '').split('/');

        if (resource === 'projects') return { data: await mockApi.mockUpdateProject(id, data) };
        if (resource === 'sections') return { data: await mockApi.mockUpdateSection(id, data) };
        if (resource === 'employees') return { data: await mockApi.mockUpdateEmployee(id, data) };
        if (resource === 'payments') return { data: await mockApi.mockUpdatePayment(id, data) };

        throw new Error(`Mock API PUT ${url} not implemented`);
    },

    async delete(url: string) {
        const [resource, id] = url.replace(/^\//, '').split('/');

        if (resource === 'projects') {
            await mockApi.mockDeleteProject(id);
            return { data: { success: true } };
        }
        if (resource === 'sections') {
            await mockApi.mockDeleteSection(id);
            return { data: { success: true } };
        }
        if (resource === 'employees') {
            await mockApi.mockDeleteEmployee(id);
            return { data: { success: true } };
        }
        if (resource === 'payments') {
            await mockApi.mockDeletePayment(id);
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
