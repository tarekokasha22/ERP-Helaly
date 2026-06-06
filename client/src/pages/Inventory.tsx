import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { mockGetProjects, mockCreateSpending, sharedInventoryItems, mockGetInventoryItems } from '../services/mockApi';
import { PlusIcon, XMarkIcon, ArchiveBoxIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';

// Flag to use mock API
const USE_MOCK_API = true;

type InventoryItem = {
  id: string;
  name: string;
  description: string;
  category: 'materials' | 'equipment' | 'tools' | 'consumables';
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  minQuantity: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  projectId?: string;
};

interface NewInventoryForm {
  name: string;
  description: string;
  category: 'materials' | 'equipment' | 'tools' | 'consumables';
  quantity: number;
  unit: string;
  unitPrice: number;
  minQuantity: number;
  supplier: string;
  location: string;
  projectId: string;
}

const initialFormState: NewInventoryForm = {
  name: '',
  description: '',
  category: 'materials',
  quantity: 0,
  unit: '',
  unitPrice: 0,
  minQuantity: 0,
  supplier: '',
  location: '',
  projectId: ''
};

// Use shared inventory items from mockApi (so Reports page can access the same data)
const inventoryItems = sharedInventoryItems as InventoryItem[];


const mockCreateInventoryItem = async (item: NewInventoryForm): Promise<InventoryItem> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const newItem: InventoryItem = {
    id: Date.now().toString(),
    ...item,
    totalValue: item.quantity * item.unitPrice,
    lastUpdated: new Date().toISOString(),
    status: item.quantity === 0 ? 'out_of_stock' :
      item.quantity <= item.minQuantity ? 'low_stock' : 'in_stock'
  };

  inventoryItems.push(newItem);

  // Automatically create a spending record if project is associated and has value
  if (item.projectId && item.projectId !== '' && newItem.totalValue > 0) {
    try {
      const spendingData = {
        date: new Date().toISOString().split('T')[0],
        amount: newItem.totalValue,
        category: 'materials', // Inventory items are typically materials
        description: `${item.category === 'materials' ? 'Materials' :
          item.category === 'equipment' ? 'Equipment' :
            item.category === 'tools' ? 'Tools' :
              'Consumables'}: ${item.name} (${item.quantity} ${item.unit})`,
        projectId: item.projectId
      };

      // Create the spending record
      await mockCreateSpending(spendingData);
      console.log(`Auto-created spending record for inventory item: ${item.name}`);
    } catch (error) {
      console.error('Failed to create automatic spending record:', error);
      // Don't fail the inventory creation if spending creation fails
    }
  }

  return newItem;
};

const Inventory: React.FC = () => {
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState<NewInventoryForm>(initialFormState);
  const [form, setForm] = useState<NewInventoryForm>(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery(['projects'], async () => {
    if (USE_MOCK_API) {
      return await mockGetProjects();
    } else {
      const res = await api.get('/projects');
      return res.data?.data || [];
    }
  });

  // Fetch inventory data
  const { data: inventory = [], isLoading, error } = useQuery<InventoryItem[]>(
    ['inventory'],
    async () => {
      if (USE_MOCK_API) {
        return await mockGetInventoryItems();
      } else {
        const res = await api.get('/inventory');
        return res.data?.data || [];
      }
    },
    {
      onError: (err: any) => {
        console.error('Error loading inventory:', err);
      }
    }
  );

  // Create inventory item mutation
  const createInventoryMutation = useMutation(
    async (newItem: NewInventoryForm) => {
      if (USE_MOCK_API) {
        return await mockCreateInventoryItem(newItem);
      } else {
        const res = await api.post('/inventory', newItem);
        return res.data?.data || newItem;
      }
    },
    {
      onSuccess: () => {
        // Invalidate all related queries to ensure fresh data everywhere
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['spendings']);
        queryClient.invalidateQueries(['projects']);

        // Force refetch dashboard data immediately
        queryClient.refetchQueries(['dashboard']);

        // Also invalidate and refetch specific project data if project was selected
        if (form.projectId) {
          queryClient.invalidateQueries(['project', form.projectId]);
          queryClient.refetchQueries(['project', form.projectId]);
        }

        // Dispatch custom events to notify dashboard of both inventory and spending changes
        window.dispatchEvent(new CustomEvent('inventoryAdded'));
        window.dispatchEvent(new CustomEvent('spendingAdded'));

        setIsCreateModalOpen(false);
        setForm(initialFormState);
        const message = form.projectId ?
          t('inventory', 'itemCreated') + ' — expense record created automatically' :
          t('inventory', 'itemCreated');
        toast.success(message);
      },
      onError: (err: any) => {
        console.error('Error creating inventory item:', err);
        toast.error(t('inventory', 'itemCreationFailed'));
      }
    }
  );

  // Update inventory item mutation
  const updateInventoryMutation = useMutation(
    async (data: { id: string; updates: NewInventoryForm }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const idx = (sharedInventoryItems as InventoryItem[]).findIndex(i => i.id === data.id);
      if (idx !== -1) {
        const updated: InventoryItem = {
          ...(sharedInventoryItems as InventoryItem[])[idx],
          ...data.updates,
          totalValue: data.updates.quantity * data.updates.unitPrice,
          lastUpdated: new Date().toISOString(),
          status: data.updates.quantity === 0 ? 'out_of_stock' :
            data.updates.quantity <= data.updates.minQuantity ? 'low_stock' : 'in_stock',
        };
        (sharedInventoryItems as InventoryItem[])[idx] = updated;
        return updated;
      }
      throw new Error('Item not found');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        queryClient.refetchQueries(['inventory']);
        setIsEditModalOpen(false);
        setEditingItem(null);
        toast.success(t('inventory', 'itemUpdated'));
      },
      onError: () => toast.error(t('inventory', 'itemUpdateFailed')),
    }
  );

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      minQuantity: item.minQuantity,
      supplier: item.supplier,
      location: item.location,
      projectId: item.projectId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' || name === 'minQuantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    updateInventoryMutation.mutate({ id: editingItem.id, updates: editForm });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' || name === 'minQuantity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createInventoryMutation.mutate(form);
  };

  const getStatusBadgeClass = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return t('inventory', 'inStock');
      case 'low_stock':
        return t('inventory', 'lowStock');
      case 'out_of_stock':
        return t('inventory', 'outOfStock');
      default:
        return status;
    }
  };

  const getCategoryText = (category: InventoryItem['category']) => {
    switch (category) {
      case 'materials':
        return t('inventory', 'materials');
      case 'equipment':
        return t('inventory', 'equipment');
      case 'tools':
        return t('inventory', 'tools');
      case 'consumables':
        return t('inventory', 'consumables');
      default:
        return category;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('inventory', 'loading')}</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-500">{t('inventory', 'loadingError')}</p>
        <p className="text-gray-500 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ArchiveBoxIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory', 'title')}</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {t('inventory', 'addItem')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('inventory', 'totalItems')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{inventory.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArchiveBoxIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('inventory', 'totalValue')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{formatMoney(totalValue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArchiveBoxIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('inventory', 'lowStockItems')}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{lowStockItems}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">{t('common', 'search')}</label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('inventory', 'searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="materials">Materials</option>
              <option value="equipment">Equipment</option>
              <option value="tools">Tools</option>
              <option value="consumables">Consumables</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'itemName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'category')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'quantity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'unitPrice')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'totalItemValue')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'project')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory', 'location')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common', 'actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t('inventory', 'noItemsFound')}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryText(item.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMoney(item.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                        {formatStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.projectId ? projects.find(p => p.id === item.projectId)?.name || t('inventory', 'unspecified') : t('inventory', 'unspecified')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title={t('inventory', 'editItem')}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        {t('inventory', 'editItem')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Item Modal */}
      {isCreateModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{t('inventory', 'addItem')}</h3>
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('inventory', 'itemName')}*</label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              value={form.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('projects', 'description')}</label>
                            <textarea
                              name="description"
                              id="description"
                              rows={2}
                              value={form.description}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('inventory', 'category')}*</label>
                              <select
                                id="category"
                                name="category"
                                required
                                value={form.category}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="materials">{t('inventory', 'materials')}</option>
                                <option value="equipment">{t('inventory', 'equipment')}</option>
                                <option value="tools">{t('inventory', 'tools')}</option>
                                <option value="consumables">{t('inventory', 'consumables')}</option>
                              </select>
                            </div>

                            <div>
                              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">{t('inventory', 'unit')}*</label>
                              <input
                                type="text"
                                name="unit"
                                id="unit"
                                required
                                value={form.unit}
                                onChange={handleInputChange}
                                placeholder="e.g. piece, meter, kg..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">{t('inventory', 'quantity')}*</label>
                              <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                required
                                min="0"
                                step="0.01"
                                value={form.quantity}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">{t('inventory', 'unitPrice')}*</label>
                              <input
                                type="number"
                                name="unitPrice"
                                id="unitPrice"
                                required
                                min="0"
                                step="0.01"
                                value={form.unitPrice}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">{t('inventory', 'minQuantity')}</label>
                            <input
                              type="number"
                              name="minQuantity"
                              id="minQuantity"
                              min="0"
                              value={form.minQuantity}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">{t('inventory', 'supplier')}</label>
                            <input
                              type="text"
                              name="supplier"
                              id="supplier"
                              value={form.supplier}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">{t('inventory', 'project')}*</label>
                            <select
                              id="projectId"
                              name="projectId"
                              required
                              value={form.projectId}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">{t('common', 'allProjects')}</option>
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">{t('inventory', 'location')}</label>
                            <input
                              type="text"
                              name="location"
                              id="location"
                              value={form.location}
                              onChange={handleInputChange}
                              placeholder="e.g. Materials warehouse - Shelf A1"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={createInventoryMutation.isLoading}
                          >
                            {createInventoryMutation.isLoading ? t('common', 'loading') : t('inventory', 'createItem')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{t('inventory', 'editItem')}</h3>
                      <button
                        type="button"
                        onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">{t('inventory', 'itemName')}*</label>
                            <input
                              type="text"
                              name="name"
                              id="edit-name"
                              required
                              value={editForm.name}
                              onChange={handleEditInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">{t('projects', 'description')}</label>
                            <textarea
                              name="description"
                              id="edit-description"
                              rows={2}
                              value={editForm.description}
                              onChange={handleEditInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">{t('inventory', 'category')}*</label>
                              <select
                                id="edit-category"
                                name="category"
                                required
                                value={editForm.category}
                                onChange={handleEditInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="materials">{t('inventory', 'materials')}</option>
                                <option value="equipment">{t('inventory', 'equipment')}</option>
                                <option value="tools">{t('inventory', 'tools')}</option>
                                <option value="consumables">{t('inventory', 'consumables')}</option>
                              </select>
                            </div>

                            <div>
                              <label htmlFor="edit-unit" className="block text-sm font-medium text-gray-700">{t('inventory', 'unit')}*</label>
                              <input
                                type="text"
                                name="unit"
                                id="edit-unit"
                                required
                                value={editForm.unit}
                                onChange={handleEditInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">{t('inventory', 'quantity')}*</label>
                              <input
                                type="number"
                                name="quantity"
                                id="edit-quantity"
                                required
                                min="0"
                                step="0.01"
                                value={editForm.quantity}
                                onChange={handleEditInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>

                            <div>
                              <label htmlFor="edit-unitPrice" className="block text-sm font-medium text-gray-700">{t('inventory', 'unitPrice')}*</label>
                              <input
                                type="number"
                                name="unitPrice"
                                id="edit-unitPrice"
                                required
                                min="0"
                                step="0.01"
                                value={editForm.unitPrice}
                                onChange={handleEditInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="edit-minQuantity" className="block text-sm font-medium text-gray-700">{t('inventory', 'minQuantity')}</label>
                            <input
                              type="number"
                              name="minQuantity"
                              id="edit-minQuantity"
                              min="0"
                              value={editForm.minQuantity}
                              onChange={handleEditInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="edit-supplier" className="block text-sm font-medium text-gray-700">{t('inventory', 'supplier')}</label>
                            <input
                              type="text"
                              name="supplier"
                              id="edit-supplier"
                              value={editForm.supplier}
                              onChange={handleEditInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="edit-projectId" className="block text-sm font-medium text-gray-700">{t('inventory', 'project')}</label>
                            <select
                              id="edit-projectId"
                              name="projectId"
                              value={editForm.projectId}
                              onChange={handleEditInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">{t('common', 'allProjects')}</option>
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">{t('inventory', 'location')}</label>
                            <input
                              type="text"
                              name="location"
                              id="edit-location"
                              value={editForm.location}
                              onChange={handleEditInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            disabled={updateInventoryMutation.isLoading}
                          >
                            {updateInventoryMutation.isLoading ? t('common', 'loading') : t('profile', 'saveChanges')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            {t('profile', 'cancel')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory; 
