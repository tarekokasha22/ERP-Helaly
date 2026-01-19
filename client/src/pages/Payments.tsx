import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface PaymentFormData {
  employeeId: string;
  paymentType: 'salary' | 'advance' | 'loan' | 'on_account' | 'piecework';
  amount: number;
  currency: 'EGP' | 'USD' | 'split';
  amountEGP?: number;
  amountUSD?: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  receiptNumber: string;
  description: string;
  paymentDate: string;
  projectId: string;
  sectionId: string;
  workQuantity: number;
  workUnit: string;
  approvedBy: string;
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const { country } = useCountry();
  const { language } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    paymentType: '',
    currency: '',
    projectId: '',
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState<PaymentFormData>({
    employeeId: '',
    paymentType: 'salary',
    amount: 0,
    currency: 'EGP',
    amountEGP: 0,
    amountUSD: 0,
    paymentMethod: 'cash',
    receiptNumber: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
    projectId: '',
    sectionId: '',
    workQuantity: 0,
    workUnit: '',
    approvedBy: user?.name || '',
  });
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmountEGP: 0,
    totalAmountUSD: 0,
    salaryPayments: 0,
    advancePayments: 0,
    loanPayments: 0,
    pieceworkPayments: 0,
    todayTotal: 0,
    thisMonthTotal: 0,
  });

  const translations = {
    en: {
      title: 'Payments Management',
      addPayment: 'Add Payment',
      editPayment: 'Edit Payment',
      employee: 'Employee',
      paymentType: 'Payment Type',
      salary: 'Salary',
      advance: 'Advance',
      loan: 'Custody',
      onAccount: 'On Account',
      piecework: 'Piecework',
      amount: 'Amount',
      currency: 'Currency',
      singleCurrency: 'Single Currency',
      splitPayment: 'Split Payment',
      amountEGP: 'Amount (EGP)',
      amountUSD: 'Amount (USD)',
      totalAmount: 'Total Amount',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      other: 'Other',
      receiptNumber: 'Receipt Number',
      description: 'Description',
      paymentDate: 'Payment Date',
      project: 'Project (Optional)',
      section: 'Section (Optional)',
      workQuantity: 'Work Quantity',
      workUnit: 'Work Unit',
      approvedBy: 'Approved By',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      totalPayments: 'Total Payments',
      totalAmountEGP: 'Total Amount (EGP)',
      totalAmountUSD: 'Total Amount (USD)',
      salaryPayments: 'Salary Payments',
      advancePayments: 'Advance Payments',
      loanPayments: 'Custody Payments',
      pieceworkPayments: 'Piecework Payments',
      todayTotal: 'Today\'s Total',
      thisMonthTotal: 'This Month\'s Total',
      paymentCreated: 'Payment created successfully',
      paymentUpdated: 'Payment updated successfully',
      paymentDeleted: 'Payment deleted successfully',
      error: 'An error occurred',
      search: 'Search...',
      filter: 'Filter',
      clearFilters: 'Clear Filters',
      export: 'Export to CSV',
      selectEmployee: 'Select Employee',
      selectProject: 'Select Project',
      selectSection: 'Select Section',
      all: 'All',
      deleteConfirm: 'Are you sure you want to delete this payment?',
      receiptNumberRequired: 'Receipt number must be unique',
      dateCannotBeFuture: 'Date cannot be in the future',
      amountMustBePositive: 'Amount must be positive',
    },
    ar: {
      title: 'إدارة المدفوعات',
      addPayment: 'إضافة دفعة',
      editPayment: 'تعديل دفعة',
      employee: 'الموظف',
      paymentType: 'نوع الدفعة',
      salary: 'راتب شهري',
      advance: 'سلفة',
      loan: 'عهدة',
      onAccount: 'تحت الحساب',
      piecework: 'دفعة عمل بالقطعة',
      amount: 'المبلغ',
      currency: 'العملة',
      singleCurrency: 'عملة واحدة',
      splitPayment: 'دفعة مقسمة',
      amountEGP: 'المبلغ (جنيه)',
      amountUSD: 'المبلغ (دولار)',
      totalAmount: 'المبلغ الإجمالي',
      paymentMethod: 'طريقة الدفع',
      cash: 'نقداً',
      bankTransfer: 'تحويل بنكي',
      check: 'شيك',
      other: 'أخرى',
      receiptNumber: 'رقم الإيصال',
      description: 'الوصف',
      paymentDate: 'تاريخ الدفع',
      project: 'المشروع (اختياري)',
      section: 'القسم (اختياري)',
      workQuantity: 'كمية العمل',
      workUnit: 'وحدة العمل',
      approvedBy: 'وافق عليه',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      totalPayments: 'إجمالي المدفوعات',
      totalAmountEGP: 'إجمالي المبلغ (جنيه)',
      totalAmountUSD: 'إجمالي المبلغ (دولار)',
      salaryPayments: 'مدفوعات الرواتب',
      advancePayments: 'مدفوعات السلف',
      loanPayments: 'مدفوعات العهد',
      pieceworkPayments: 'مدفوعات القطعة',
      todayTotal: 'إجمالي اليوم',
      thisMonthTotal: 'إجمالي الشهر',
      paymentCreated: 'تم إنشاء الدفعة بنجاح',
      paymentUpdated: 'تم تحديث الدفعة بنجاح',
      paymentDeleted: 'تم حذف الدفعة بنجاح',
      error: 'حدث خطأ',
      search: 'البحث...',
      filter: 'فلترة',
      clearFilters: 'مسح الفلاتر',
      export: 'تصدير إلى CSV',
      selectEmployee: 'اختر الموظف',
      selectProject: 'اختر المشروع',
      selectSection: 'اختر القسم',
      all: 'الكل',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الدفعة؟',
      receiptNumberRequired: 'رقم الإيصال يجب أن يكون فريداً',
      dateCannotBeFuture: 'التاريخ لا يمكن أن يكون في المستقبل',
      amountMustBePositive: 'المبلغ يجب أن يكون موجباً',
    },
  };

  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    fetchPayments();
    fetchEmployees();
    fetchProjects();
    fetchSections();
    fetchStats();
  }, [country]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payments/${country}`);
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get(`/employees/${country}`);
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get(`/projects/${country}`);
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get(`/sections/${country}`);
      setSections(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/payments/${country}/stats`);
      const statsData = response.data.data;
      
      // Calculate today's and this month's totals
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const todayPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() === today.getTime();
      });
      
      const thisMonthPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= thisMonthStart;
      });
      
      const todayTotalEGP = todayPayments.reduce((sum, p) => 
        sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0
      );
      const todayTotalUSD = todayPayments.reduce((sum, p) => 
        sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0
      );
      
      const monthTotalEGP = thisMonthPayments.reduce((sum, p) => 
        sum + (p.amountEGP || (p.currency === 'EGP' ? p.amount : 0)), 0
      );
      const monthTotalUSD = thisMonthPayments.reduce((sum, p) => 
        sum + (p.amountUSD || (p.currency === 'USD' ? p.amount : 0)), 0
      );
      
      setStats({
        ...statsData,
        todayTotal: todayTotalEGP + todayTotalUSD,
        thisMonthTotal: monthTotalEGP + monthTotalUSD,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by employee
    if (filters.employeeId) {
      filtered = filtered.filter(p => p.employeeId === filters.employeeId);
    }

    // Filter by payment type
    if (filters.paymentType) {
      filtered = filtered.filter(p => p.paymentType === filters.paymentType);
    }

    // Filter by currency
    if (filters.currency) {
      filtered = filtered.filter(p => p.currency === filters.currency);
    }

    // Filter by project
    if (filters.projectId) {
      filtered = filtered.filter(p => p.projectId === filters.projectId);
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(p => new Date(p.paymentDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => new Date(p.paymentDate) <= new Date(filters.endDate));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (new Date(formData.paymentDate) > new Date()) {
      toast.error(t.dateCannotBeFuture);
      return;
    }

    if (formData.amount <= 0 && formData.currency !== 'split') {
      toast.error(t.amountMustBePositive);
      return;
    }

    if (formData.currency === 'split') {
      if (!formData.amountEGP || !formData.amountUSD || formData.amountEGP <= 0 || formData.amountUSD <= 0) {
        toast.error(t.amountMustBePositive);
        return;
      }
      formData.amount = formData.amountEGP + formData.amountUSD;
    }

    // Check receipt number uniqueness
    if (formData.receiptNumber) {
      const existingPayment = payments.find(
        p => p.receiptNumber === formData.receiptNumber && p.id !== editingPayment?.id
      );
      if (existingPayment) {
        toast.error(t.receiptNumberRequired);
        return;
      }
    }

    try {
      const paymentData = { ...formData };
      if (paymentData.currency !== 'split') {
        // For single currency, set amountEGP or amountUSD based on currency
        if (paymentData.currency === 'EGP') {
          paymentData.amountEGP = paymentData.amount;
          paymentData.amountUSD = 0;
        } else {
          paymentData.amountEGP = 0;
          paymentData.amountUSD = paymentData.amount;
        }
      }

      if (editingPayment) {
        await api.put(`/payments/${country}/${editingPayment.id}`, paymentData);
        toast.success(t.paymentUpdated);
      } else {
        await api.post(`/payments/${country}`, paymentData);
        toast.success(t.paymentCreated);
      }
      setShowForm(false);
      setEditingPayment(null);
      resetForm();
      fetchPayments();
      fetchStats();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error(t.error);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      employeeId: payment.employeeId,
      paymentType: payment.paymentType,
      amount: payment.amount,
      currency: payment.currency,
      amountEGP: payment.amountEGP || (payment.currency === 'EGP' ? payment.amount : 0),
      amountUSD: payment.amountUSD || (payment.currency === 'USD' ? payment.amount : 0),
      paymentMethod: payment.paymentMethod,
      receiptNumber: payment.receiptNumber || '',
      description: payment.description,
      paymentDate: payment.paymentDate.split('T')[0],
      projectId: payment.projectId || '',
      sectionId: payment.sectionId || '',
      workQuantity: payment.workQuantity || 0,
      workUnit: payment.workUnit || '',
      approvedBy: payment.approvedBy,
    });
    setShowForm(true);
  };

  const handleDelete = async (payment: Payment) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await api.delete(`/payments/${country}/${payment.id}`);
        toast.success(t.paymentDeleted);
        fetchPayments();
        fetchStats();
      } catch (error) {
        console.error('Error deleting payment:', error);
        toast.error(t.error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      paymentType: 'salary',
      amount: 0,
      currency: 'EGP',
      amountEGP: 0,
      amountUSD: 0,
      paymentMethod: 'cash',
      receiptNumber: '',
      description: '',
      paymentDate: new Date().toISOString().split('T')[0],
      projectId: '',
      sectionId: '',
      workQuantity: 0,
      workUnit: '',
      approvedBy: user?.name || '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
    resetForm();
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      paymentType: '',
      currency: '',
      projectId: '',
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Type', 'Amount EGP', 'Amount USD', 'Method', 'Receipt', 'Project'];
    const rows = filteredPayments.map(p => [
      new Date(p.paymentDate).toLocaleDateString(),
      p.employeeName || '',
      p.paymentType,
      p.amountEGP || (p.currency === 'EGP' ? p.amount : 0),
      p.amountUSD || (p.currency === 'USD' ? p.amount : 0),
      p.paymentMethod,
      p.receiptNumber || '',
      p.projectName || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US');
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      salary: t.salary,
      advance: t.advance,
      loan: t.loan,
      on_account: t.onAccount,
      piecework: t.piecework,
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: t.cash,
      bank_transfer: t.bankTransfer,
      check: t.check,
      other: t.other,
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            {t.addPayment}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.totalPayments}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.totalAmountEGP}</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalAmountEGP.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.totalAmountUSD}</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalAmountUSD.toLocaleString()} USD</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.todayTotal}</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.todayTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              {t.export}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.all} {t.employee}</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.all} {t.paymentType}</option>
              <option value="salary">{t.salary}</option>
              <option value="advance">{t.advance}</option>
              <option value="loan">{t.loan}</option>
              <option value="on_account">{t.onAccount}</option>
              <option value="piecework">{t.piecework}</option>
            </select>
            <select
              value={filters.currency}
              onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.all} {t.currency}</option>
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="split">{t.splitPayment}</option>
            </select>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.all} {t.project}</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              placeholder="Start Date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              placeholder="End Date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors w-fit"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showForm && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPayment ? t.editPayment : t.addPayment}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.employee} *
                  </label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t.selectEmployee}</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.paymentType} *
                  </label>
                  <select
                    required
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="salary">{t.salary}</option>
                    <option value="advance">{t.advance}</option>
                    <option value="loan">{t.loan}</option>
                    <option value="on_account">{t.onAccount}</option>
                    <option value="piecework">{t.piecework}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.currency} *
                  </label>
                  <select
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="split">{t.splitPayment}</option>
                  </select>
                </div>
                {formData.currency === 'split' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.amountEGP} *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amountEGP || 0}
                        onChange={(e) => setFormData({ ...formData, amountEGP: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.amountUSD} *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amountUSD || 0}
                        onChange={(e) => setFormData({ ...formData, amountUSD: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.totalAmount}
                      </label>
                      <input
                        type="text"
                        value={(formData.amountEGP || 0) + (formData.amountUSD || 0)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.amount} *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.paymentMethod} *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">{t.cash}</option>
                    <option value="bank_transfer">{t.bankTransfer}</option>
                    <option value="check">{t.check}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.receiptNumber}
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.paymentDate} *
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.project}
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t.selectProject}</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.section}
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t.selectSection}</option>
                    {sections
                      .filter(s => !formData.projectId || s.projectId === formData.projectId)
                      .map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                  </select>
                </div>
                {formData.paymentType === 'piecework' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.workQuantity} *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.workQuantity}
                        onChange={(e) => setFormData({ ...formData, workQuantity: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.workUnit} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.workUnit}
                        onChange={(e) => setFormData({ ...formData, workUnit: e.target.value })}
                        placeholder="متر، كيلو، إلخ"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.approvedBy} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.description} *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.employee}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.paymentType}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.paymentMethod}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.receiptNumber}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.paymentDate}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.project}</th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.employeeName}</div>
                      <div className="text-sm text-gray-500">{payment.employeeType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.paymentType === 'salary' ? 'bg-green-100 text-green-800' :
                      payment.paymentType === 'advance' ? 'bg-yellow-100 text-yellow-800' :
                      payment.paymentType === 'loan' ? 'bg-red-100 text-red-800' :
                      payment.paymentType === 'piecework' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getPaymentTypeLabel(payment.paymentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.currency === 'split' 
                      ? `${(payment.amountEGP || 0).toLocaleString()} EGP + ${(payment.amountUSD || 0).toLocaleString()} USD`
                      : `${payment.amount.toLocaleString()} ${payment.currency}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.receiptNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.projectName || '-'}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No payments found</p>
        </div>
      )}
    </div>
  );
};

export default Payments;
