declare module 'react-query';
declare module 'chart.js';
declare module 'react-chartjs-2';
declare module 'react-toastify';

// Road Construction Project Types
interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  budget: number;
  manager: string;
  totalLength: number;
  unit: string;
  progress: number;
  location: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  country: 'egypt' | 'libya';
  createdAt: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
  status: string;
  assignedTo: string;
  projectId: string;
  targetQuantity: number;
  completedQuantity: number;
  progress: number;
  country: 'egypt' | 'libya';
  createdAt: string;
  // Optional legacy fields for backward compatibility
  manager?: string;
  budget?: number;
  details?: string;
  employees?: number;
}

interface Spending {
  id: string;
  projectId: string;
  projectName: string;
  sectionId: string;
  sectionName: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  approvedBy: string;
  country: 'egypt' | 'libya';
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  employeeType: 'monthly' | 'piecework';
  position: string;
  monthlySalary?: number;
  pieceworkRate?: number;
  currency: 'EGP' | 'USD';
  country: 'egypt' | 'libya';
  active: boolean;
  hireDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Financial tracking (calculated fields)
  totalEarned?: number;
  totalPaid?: number;
  totalPaidEGP?: number;
  totalPaidUSD?: number;
  balance?: number;
  // Payment history
  payments?: Payment[];
  // Project assignments
  assignedProjects?: string[];
  activeProjects?: number;
}

interface Payment {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeType?: string;
  paymentType: 'salary' | 'advance' | 'loan' | 'on_account' | 'piecework';
  amount: number;
  currency: 'EGP' | 'USD' | 'split';
  amountEGP?: number; // For split payments
  amountUSD?: number; // For split payments
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  receiptNumber?: string;
  description: string;
  paymentDate: string;
  projectId?: string;
  projectName?: string;
  sectionId?: string;
  sectionName?: string;
  workQuantity?: number;
  workUnit?: string;
  approvedBy: string;
  country: 'egypt' | 'libya';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
} 