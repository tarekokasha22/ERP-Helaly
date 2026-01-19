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
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  employeeType: 'monthly' | 'piecework';
  position: string;
  monthlySalary: number;
  pieceworkRate: number;
  currency: 'EGP' | 'USD';
  hireDate: string;
  notes: string;
}

const Employees: React.FC = () => {
  const { user } = useAuth();
  const { country } = useCountry();
  const { language } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'piecework'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    employeeType: 'monthly',
    position: '',
    monthlySalary: 0,
    pieceworkRate: 0,
    currency: 'EGP',
    hireDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    monthlyEmployees: 0,
    pieceworkEmployees: 0,
    totalMonthlySalary: 0,
  });

  const translations = {
    en: {
      title: 'Employees Management',
      addEmployee: 'Add Employee',
      editEmployee: 'Edit Employee',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      employeeType: 'Employee Type',
      monthly: 'Monthly Employee',
      piecework: 'Piece-Rate Worker',
      position: 'Position',
      monthlySalary: 'Monthly Salary',
      pieceworkRate: 'Rate Per Piece',
      currency: 'Currency',
      hireDate: 'Hire Date',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      active: 'Active',
      inactive: 'Inactive',
      totalEmployees: 'Total Employees',
      activeEmployees: 'Active Employees',
      monthlyEmployees: 'Monthly Employees',
      pieceworkEmployees: 'Piece-Rate Workers',
      totalMonthlySalary: 'Total Monthly Salary',
      employeeCreated: 'Employee created successfully',
      employeeUpdated: 'Employee updated successfully',
      employeeDeleted: 'Employee deactivated successfully',
      error: 'An error occurred',
      search: 'Search by name...',
      filter: 'Filter',
      all: 'All',
      balance: 'Balance',
      totalEarned: 'Total Earned',
      totalPaid: 'Total Paid',
      viewPaymentHistory: 'Payment History',
      activeProjects: 'Active Projects',
      noPayments: 'No payments yet',
      deleteConfirm: 'Are you sure you want to deactivate this employee?',
      cannotDelete: 'Cannot delete employee with payment history',
      paymentDate: 'Payment Date',
      paymentType: 'Type',
      paymentMethod: 'Method',
      amount: 'Amount',
    },
    ar: {
      title: 'إدارة الموظفين والعمال',
      addEmployee: 'إضافة موظف',
      editEmployee: 'تعديل موظف',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      employeeType: 'نوع الموظف',
      monthly: 'موظف براتب شهري',
      piecework: 'عامل بالقطعة',
      position: 'المنصب',
      monthlySalary: 'الراتب الشهري',
      pieceworkRate: 'سعر القطعة',
      currency: 'العملة',
      hireDate: 'تاريخ التعيين',
      notes: 'ملاحظات',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      active: 'نشط',
      inactive: 'غير نشط',
      totalEmployees: 'إجمالي الموظفين',
      activeEmployees: 'الموظفين النشطين',
      monthlyEmployees: 'الموظفين الشهريين',
      pieceworkEmployees: 'العمال بالقطعة',
      totalMonthlySalary: 'إجمالي الرواتب الشهرية',
      employeeCreated: 'تم إنشاء الموظف بنجاح',
      employeeUpdated: 'تم تحديث الموظف بنجاح',
      employeeDeleted: 'تم إلغاء تفعيل الموظف بنجاح',
      error: 'حدث خطأ',
      search: 'البحث بالاسم...',
      filter: 'فلترة',
      all: 'الكل',
      balance: 'الرصيد',
      totalEarned: 'إجمالي المستحقات',
      totalPaid: 'إجمالي المدفوع',
      viewPaymentHistory: 'سجل المدفوعات',
      activeProjects: 'المشاريع النشطة',
      noPayments: 'لا توجد مدفوعات بعد',
      deleteConfirm: 'هل أنت متأكد من إلغاء تفعيل هذا الموظف؟',
      cannotDelete: 'لا يمكن حذف موظف لديه سجل مدفوعات',
      paymentDate: 'تاريخ الدفع',
      paymentType: 'النوع',
      paymentMethod: 'الطريقة',
      amount: 'المبلغ',
    },
  };

  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [country]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, filterType]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/${country}`);
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/employees/${country}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(emp => emp.employeeType === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${country}/${editingEmployee.id}`, formData);
        toast.success(t.employeeUpdated);
      } else {
        await api.post(`/employees/${country}`, formData);
        toast.success(t.employeeCreated);
      }
      setShowForm(false);
      setEditingEmployee(null);
      resetForm();
      fetchEmployees();
      fetchStats();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(t.error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      employeeType: employee.employeeType,
      position: employee.position,
      monthlySalary: employee.monthlySalary || 0,
      pieceworkRate: employee.pieceworkRate || 0,
      currency: employee.currency,
      hireDate: employee.hireDate.split('T')[0],
      notes: employee.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (employee: Employee) => {
    // Check if employee has payment history
    if (employee.payments && employee.payments.length > 0) {
      toast.error(t.cannotDelete);
      return;
    }

    if (window.confirm(t.deleteConfirm)) {
      try {
        await api.delete(`/employees/${country}/${employee.id}`);
        toast.success(t.employeeDeleted);
        fetchEmployees();
        fetchStats();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error(t.error);
      }
    }
  };

  const handleViewPaymentHistory = async (employee: Employee) => {
    try {
      // Fetch full employee data with payment history
      const response = await api.get(`/employees/${country}/${employee.id}`);
      setSelectedEmployee(response.data.data);
      setShowPaymentHistory(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error(t.error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeType: 'monthly',
      position: '',
      monthlySalary: 0,
      pieceworkRate: 0,
      currency: 'EGP',
      hireDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
    resetForm();
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
            {t.addEmployee}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.totalEmployees}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.activeEmployees}</h3>
          <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.monthlyEmployees}</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.monthlyEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.pieceworkEmployees}</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.pieceworkEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{t.totalMonthlySalary}</h3>
          <p className="text-2xl font-bold text-orange-600">
            {stats.totalMonthlySalary.toLocaleString()} {country === 'egypt' ? 'EGP' : 'USD'}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
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
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.all}</option>
              <option value="monthly">{t.monthly}</option>
              <option value="piecework">{t.piecework}</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? '📋' : '🔲'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingEmployee ? t.editEmployee : t.addEmployee}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.name} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.employeeType} *
                  </label>
                  <select
                    required
                    value={formData.employeeType}
                    onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as 'monthly' | 'piecework' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">{t.monthly}</option>
                    <option value="piecework">{t.piecework}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.position} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.currency} *
                  </label>
                  <select
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'EGP' | 'USD' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {formData.employeeType === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.monthlySalary} *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {formData.employeeType === 'piecework' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.pieceworkRate} *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.pieceworkRate}
                      onChange={(e) => setFormData({ ...formData, pieceworkRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.hireDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

      {/* Payment History Modal */}
      {showPaymentHistory && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {t.viewPaymentHistory} - {selectedEmployee.name}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentHistory(false);
                  setSelectedEmployee(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {selectedEmployee.payments && selectedEmployee.payments.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{t.totalEarned}</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedEmployee.totalEarned || 0, selectedEmployee.currency)}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{t.totalPaid}</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedEmployee.totalPaid || 0, selectedEmployee.currency)}</p>
                  </div>
                  <div className={`p-3 rounded ${(selectedEmployee.balance || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm text-gray-600">{t.balance}</p>
                    <p className={`text-lg font-bold ${(selectedEmployee.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedEmployee.balance || 0, selectedEmployee.currency)}
                    </p>
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.paymentDate}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.paymentType}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.amount}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.paymentMethod}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedEmployee.payments.map((payment: any) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {formatDate(payment.date || payment.paymentDate || '')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{payment.paymentType}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {payment.currency === 'split' 
                            ? `${formatCurrency(payment.amountEGP || 0, 'EGP')} + ${formatCurrency(payment.amountUSD || 0, 'USD')}`
                            : formatCurrency(payment.amount || 0, payment.currency || 'EGP')
                          }
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{payment.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">{t.noPayments}</p>
            )}
          </div>
        </div>
      )}

      {/* Employees Grid/Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.active ? t.active : t.inactive}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 text-xs rounded ${
                      employee.employeeType === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {employee.employeeType === 'monthly' ? t.monthly : t.piecework}
                    </span>
                  </div>
                  {employee.email && (
                    <p className="text-sm text-gray-600">{employee.email}</p>
                  )}
                  {employee.phone && (
                    <p className="text-sm text-gray-600">{employee.phone}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    {formatDate(employee.hireDate)}
                  </p>
                </div>
                <div className="border-t pt-4 space-y-2">
                  {employee.balance !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.balance}:</span>
                      <span className={`font-bold ${employee.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(employee.balance, employee.currency)}
                      </span>
                    </div>
                  )}
                  {employee.activeProjects !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.activeProjects}:</span>
                      <span className="font-semibold">{employee.activeProjects}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleViewPaymentHistory(employee)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    {t.viewPaymentHistory}
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.name}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.position}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.employeeType}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.balance}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.activeProjects}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        {employee.email && (
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.employeeType === 'monthly' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {employee.employeeType === 'monthly' ? t.monthly : t.piecework}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${employee.balance && employee.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {employee.balance !== undefined ? formatCurrency(employee.balance, employee.currency) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.activeProjects || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPaymentHistory(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>{t.search ? 'No employees found' : 'No employees yet'}</p>
        </div>
      )}
    </div>
  );
};

export default Employees;
