import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockGetEmployees, mockGetEmployeeById, mockCreateEmployee, mockUpdateEmployee, mockDeleteEmployee, mockGetEmployeeStats, mockGetProjects, mockGetSections } from '../services/mockApi';
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
  employeeType: 'monthly' | 'daily';
  position: string;
  monthlySalary: number;
  dailyRate: number;
  currency: 'EGP' | 'USD';
  hireDate: string;
  notes: string;
  departmentId: string;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  projectId?: string;
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
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'daily'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    employeeType: 'monthly',
    position: '',
    monthlySalary: 0,
    dailyRate: 0,
    currency: 'EGP',
    hireDate: new Date().toISOString().split('T')[0],
    notes: '',
    departmentId: '',
    projectId: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    monthlyEmployees: 0,
    dailyEmployees: 0,
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
      daily: 'Daily Worker',
      position: 'Position',
      monthlySalary: 'Monthly Salary',
      dailyRate: 'Daily Rate',
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
      dailyEmployees: 'Daily Workers',
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
      project: 'Project',
      department: 'Department',
      selectProject: 'Select Project',
      selectDepartment: 'Select Department',
      noDepartments: 'No departments in this project',
      noEmployees: 'No employees found',
      noEmployeesDesc: 'Start by adding new employees',
      manageStaff: 'Manage staff and payroll',
      allProjects: 'All Projects',
    },
    ar: {
      title: 'إدارة العاملين',
      addEmployee: 'إضافة عامل',
      editEmployee: 'تعديل عامل',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      employeeType: 'نوع العامل',
      monthly: 'موظف شهري',
      daily: 'عامل باليومية',
      position: 'المنصب',
      monthlySalary: 'الراتب الشهري',
      dailyRate: 'السعر اليومي',
      currency: 'العملة',
      hireDate: 'تاريخ التعيين',
      notes: 'ملاحظات',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      active: 'نشط',
      inactive: 'غير نشط',
      totalEmployees: 'إجمالي العاملين',
      activeEmployees: 'العاملين النشطين',
      monthlyEmployees: 'الموظفين الشهريين',
      dailyEmployees: 'العمال باليومية',
      totalMonthlySalary: 'إجمالي الرواتب الشهرية',
      employeeCreated: 'تم إنشاء العامل بنجاح',
      employeeUpdated: 'تم تحديث العامل بنجاح',
      employeeDeleted: 'تم إلغاء تفعيل العامل بنجاح',
      error: 'حدث خطأ',
      search: 'البحث بالاسم...',
      filter: 'تصفية',
      all: 'الكل',
      balance: 'الرصيد',
      totalEarned: 'إجمالي المكتسب',
      totalPaid: 'إجمالي المدفوع',
      viewPaymentHistory: 'سجل المدفوعات',
      activeProjects: 'المشاريع النشطة',
      noPayments: 'لا توجد مدفوعات بعد',
      deleteConfirm: 'هل أنت متأكد أنك تريد إلغاء تفعيل هذا الموظف؟',
      cannotDelete: 'لا يمكن حذف موظف لديه سجل مدفوعات',
      paymentDate: 'تاريخ الدفع',
      paymentType: 'النوع',
      paymentMethod: 'طريقة الدفع',
      amount: 'المبلغ',
      project: 'المشروع',
      department: 'القسم',
      selectProject: 'اختر المشروع',
      selectDepartment: 'اختر القسم',
      noDepartments: 'لا توجد أقسام في هذا المشروع',
      noEmployees: 'لا يوجد موظفون',
      noEmployeesDesc: 'ابدأ بإضافة موظفين جدد',
      manageStaff: 'إدارة الموظفين والرواتب',
      allProjects: 'جميع المشاريع',
    },
  };

  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    fetchEmployees();
    fetchStats();
    fetchProjectsAndSections();
  }, [country]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, filterType, filterProject]);

  // Filter sections based on selected project
  useEffect(() => {
    if (formData.projectId) {
      const filtered = sections.filter(section => section.projectId === formData.projectId);
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
  }, [formData.projectId, sections]);

  const fetchProjectsAndSections = async () => {
    if (!country) return;
    try {
      const [projectsData, sectionsData] = await Promise.all([
        mockGetProjects(),
        mockGetSections()
      ]);
      setProjects(projectsData || []);
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error fetching projects/sections:', error);
    }
  };

  const fetchEmployees = async () => {
    if (!country) {
      console.log('Country not set, skipping fetch');
      return;
    }
    try {
      setLoading(true);
      const employeesData = await mockGetEmployees(country);
      setEmployees((employeesData as any) || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!country) {
      return;
    }
    try {
      const statsData = await mockGetEmployeeStats(country);
      setStats(statsData);
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

    // Filter by project
    if (filterProject !== 'all') {
      filtered = filtered.filter(emp => emp.projectId === filterProject);
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
    if (!country) return;
    try {
      // Prepare data with sectionId instead of departmentId for backend compatibility
      const submitData = {
        ...formData,
        sectionId: formData.departmentId, // Backend uses sectionId
      };

      if (editingEmployee) {
        await mockUpdateEmployee(country, editingEmployee.id, submitData);
        toast.success(t.employeeUpdated);
      } else {
        await mockCreateEmployee(country, submitData);
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
    setEditingEmployee(employee as any);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      employeeType: employee.employeeType,
      position: employee.position,
      monthlySalary: employee.monthlySalary || 0,
      dailyRate: employee.dailyRate || 0,
      currency: employee.currency,
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: employee.notes || '',
      departmentId: (employee as any).departmentId || (employee as any).sectionId || '',
      projectId: (employee as any).projectId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (employee: Employee) => {
    // Check if employee has payment history
    if (employee.payments && employee.payments.length > 0) {
      toast.error(t.cannotDelete);
      return;
    }

    if (!country) return;
    if (window.confirm(t.deleteConfirm)) {
      try {
        await mockDeleteEmployee(country, employee.id);
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
    if (!country) return;
    try {
      // Fetch full employee data with payment history
      const employeeData = await mockGetEmployeeById(country, employee.id);
      setSelectedEmployee(employeeData as any);
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
      dailyRate: 0,
      currency: 'EGP',
      hireDate: new Date().toISOString().split('T')[0],
      notes: '',
      departmentId: '',
      projectId: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
    resetForm();
  };

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-36 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 animate-pulse mb-3" />
              <div className="h-7 w-16 rounded-lg bg-slate-200 animate-pulse mb-2" />
              <div className="h-3 w-20 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-4 w-24 rounded-lg bg-slate-100 animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-4 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-9 flex-1 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">{t.manageStaff}</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5" />
            {t.addEmployee}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: t.totalEmployees,     val: stats.totalEmployees,    color: 'gradient-blue',    icon: '👥' },
          { label: t.activeEmployees,    val: stats.activeEmployees,   color: 'gradient-success', icon: '✅' },
          { label: t.monthlyEmployees,   val: stats.monthlyEmployees,  color: 'gradient-brand',   icon: '📅' },
          { label: t.dailyEmployees,     val: stats.dailyEmployees,    color: 'gradient-purple',  icon: '🔄' },
          { label: t.totalMonthlySalary, val: `${stats.totalMonthlySalary?.toLocaleString() || 0} ${country === 'egypt' ? 'EGP' : 'USD'}`, color: 'gradient-teal', icon: '💰' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center text-base mb-3`}>{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input ps-10 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="form-select"
            >
              <option value="all">{t.all}</option>
              <option value="monthly">{t.monthly}</option>
              <option value="daily">{t.daily}</option>
            </select>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="form-select"
            >
              <option value="all">{t.allProjects || 'All Projects'}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-800">
                {editingEmployee ? t.editEmployee : t.addEmployee}
              </h2>
              <button onClick={handleCancel} className="btn-icon text-slate-400 hover:text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.employeeType} *
                  </label>
                  <select
                    required
                    value={formData.employeeType}
                    onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as 'monthly' | 'daily' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">{t.monthly}</option>
                    <option value="daily">{t.daily}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                {formData.employeeType === 'daily' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t.dailyRate} *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
              {/* Project and Department Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    🏗️ {t.project}
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value, departmentId: '' })}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    🏢 {t.department}
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.projectId}
                  >
                    <option value="">{t.selectDepartment}</option>
                    {filteredSections.length === 0 && formData.projectId ? (
                      <option disabled>{t.noDepartments}</option>
                    ) : (
                      filteredSections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))
                    )}
                  </select>
                  {formData.projectId && filteredSections.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">{t.noDepartments}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {t.save}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-800">
                {t.viewPaymentHistory} — {selectedEmployee.name}
              </h2>
              <button
                onClick={() => { setShowPaymentHistory(false); setSelectedEmployee(null); }}
                className="btn-icon text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >✕</button>
            </div>
            <div className="p-6">
            {selectedEmployee.payments && selectedEmployee.payments.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.paymentDate}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.paymentType}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.amount}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.paymentMethod}</th>
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
              <p className="text-center text-slate-500 py-8">{t.noPayments}</p>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Employees Grid/Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((employee, idx) => (
            <div
              key={employee.id}
              className="card p-5 flex flex-col animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Card top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{employee.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{employee.position}</p>
                </div>
                <span className={`badge ms-2 shrink-0 ${employee.active ? 'badge-success' : 'badge-danger'}`}>
                  {employee.active ? t.active : t.inactive}
                </span>
              </div>

              {/* Type + info */}
              <div className="space-y-1.5 mb-3">
                <div>
                  <span className={`badge ${employee.employeeType === 'monthly' ? 'badge-info' : 'badge-brand'}`}>
                    {employee.employeeType === 'monthly' ? t.monthly : t.daily}
                  </span>
                </div>
                {employee.email && (
                  <p className="text-xs text-slate-500 truncate">{employee.email}</p>
                )}
                {employee.phone && (
                  <p className="text-xs text-slate-500">{employee.phone}</p>
                )}
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                  {formatDate(employee.hireDate)}
                </p>
              </div>

              {/* Balance row */}
              <div className="border-t border-slate-100 pt-3 mt-auto space-y-1">
                {employee.balance !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.balance}</span>
                    <span className={`text-sm font-bold tabular-nums ${employee.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(employee.balance, employee.currency)}
                    </span>
                  </div>
                )}
                {employee.activeProjects !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.activeProjects}</span>
                    <span className="text-xs font-semibold text-slate-700">{employee.activeProjects}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleViewPaymentHistory(employee)}
                  className="btn btn-sm flex-1"
                  style={{
                    background: 'rgba(59,130,246,0.08)',
                    color: '#2563eb',
                    border: '1px solid rgba(59,130,246,0.15)',
                    height: '32px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  {t.viewPaymentHistory}
                </button>
                {user?.role === 'admin' && (
                  <>
                    <button onClick={() => handleEdit(employee)} className="btn-icon text-slate-400 hover:text-brand-600 hover:bg-brand-50">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(employee)} className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
                  <th className="table-header">{t.name}</th>
                  <th className="table-header">{t.position}</th>
                  <th className="table-header">{t.employeeType}</th>
                  <th className="table-header">{t.balance}</th>
                  <th className="table-header">{t.activeProjects}</th>
                  <th className="table-header">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{employee.name}</div>
                        {employee.email && (
                          <div className="text-xs text-slate-500 mt-0.5">{employee.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-sm text-slate-700">
                      {employee.position}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${employee.employeeType === 'monthly' ? 'badge-info' : 'badge-brand'}`}>
                        {employee.employeeType === 'monthly' ? t.monthly : t.daily}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`text-sm font-bold tabular-nums ${employee.balance && employee.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {employee.balance !== undefined ? formatCurrency(employee.balance, employee.currency) : '—'}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-slate-700">
                      {employee.activeProjects || 0}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewPaymentHistory(employee)}
                          className="btn-icon text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <button onClick={() => handleEdit(employee)} className="btn-icon text-slate-400 hover:text-brand-600 hover:bg-brand-50">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(employee)} className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50">
                              <TrashIcon className="h-4 w-4" />
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
        <div className="card py-16 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center mx-auto mb-3">
            <UserGroupIcon className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{t.noEmployees || 'No employees found'}</p>
          <p className="text-xs text-slate-400 mt-1">{t.noEmployeesDesc || 'Start by adding new employees'}</p>
        </div>
      )}
    </div>
  );
};

export default Employees;
