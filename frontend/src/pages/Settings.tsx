import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Building, Tag, X, RefreshCw, Check, Hospital, Phone, Mail, Globe, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

interface Department {
  id: number;
  name: string;
  created_at: string;
}

interface Particular {
  id: number;
  name: string;
  opdefault: boolean;
  ipdefault: boolean;
  sortorder: number;
  created_at: string;
}

interface HospitalSettings {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  footer_note: string;
  updated_at?: string;
}

const SettingsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [particulars, setParticulars] = useState<Particular[]>([]);
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    footer_note: 'Thank you for your visit'
  });
  const [activeTab, setActiveTab] = useState<'departments' | 'particulars' | 'hospital'>('hospital');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHospital, setIsSavingHospital] = useState(false);
  
  // Forms
  const [newDeptName, setNewDeptName] = useState('');
  const [showDeptForm, setShowDeptForm] = useState(false);
  
  const [newParticularName, setNewParticularName] = useState('');
  const [newParticularOpDefault, setNewParticularOpDefault] = useState(false);
  const [newParticularIpDefault, setNewParticularIpDefault] = useState(false);
  const [newParticularSortOrder, setNewParticularSortOrder] = useState<number>(-1);
  const [showParticularForm, setShowParticularForm] = useState(false);
  
  const [stats, setStats] = useState({
    total_departments: 0,
    total_particulars: 0,
    hospital_configured: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptsRes, partsRes, statsRes, hospitalRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/settings/departments`),
        axios.get(`${API_BASE_URL}/settings/particulars`),
        axios.get(`${API_BASE_URL}/settings/stats`),
        axios.get(`${API_BASE_URL}/settings/hospital`).catch(() => null) // Handle if endpoint doesn't exist yet
      ]);

      setDepartments(deptsRes.data);
      setParticulars(partsRes.data);
      setStats({
        ...statsRes.data,
        hospital_configured: hospitalRes?.data ? true : false
      });
      
      if (hospitalRes?.data) {
        setHospitalSettings(hospitalRes.data);
      }
      
      toast.success('Settings loaded');
    } catch (error: any) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/settings/departments`, {
        name: newDeptName
      });
      
      setDepartments([...departments, response.data]);
      setNewDeptName('');
      setShowDeptForm(false);
      
      toast.success('Department added');
      loadData(); // Reload stats
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add department');
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    const confirmDelete = window.confirm('Delete this department?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/settings/departments/${id}`);
      setDepartments(departments.filter(dept => dept.id !== id));
      toast.success('Department deleted');
      loadData(); // Reload stats
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete department');
    }
  };

  const handleAddParticular = async () => {
    if (!newParticularName.trim()) {
      toast.error('Particular name is required');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/settings/particulars`, {
        name: newParticularName,
        opdefault: newParticularOpDefault,
        ipdefault: newParticularIpDefault,
        sortorder: newParticularSortOrder
      });
      
      setParticulars([...particulars, response.data]);
      // Reset form
      setNewParticularName('');
      setNewParticularOpDefault(false);
      setNewParticularIpDefault(false);
      setNewParticularSortOrder(-1);
      setShowParticularForm(false);
      
      toast.success('Particular added');
      loadData(); // Reload stats
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add particular');
    }
  };

  const handleDeleteParticular = async (id: number) => {
    const confirmDelete = window.confirm('Delete this particular?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/settings/particulars/${id}`);
      setParticulars(particulars.filter(p => p.id !== id));
      toast.success('Particular deleted');
      loadData(); // Reload stats
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete particular');
    }
  };

  const handleSaveHospital = async () => {
    if (!hospitalSettings.name.trim()) {
      toast.error('Hospital name is required');
      return;
    }
    if (!hospitalSettings.address.trim()) {
      toast.error('Hospital address is required');
      return;
    }
    if (!hospitalSettings.phone.trim()) {
      toast.error('Hospital phone number is required');
      return;
    }

    setIsSavingHospital(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/settings/hospital`, hospitalSettings);
      setHospitalSettings(response.data);
      toast.success('Hospital settings saved successfully');
      loadData(); // Reload stats to update hospital_configured flag
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save hospital settings');
    } finally {
      setIsSavingHospital(false);
    }
  };

  const getDefaultBadge = (particular: Particular) => {
    const badges = [];
    if (particular.opdefault) {
      badges.push(<span key="op" className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">OP Default</span>);
    }
    if (particular.ipdefault) {
      badges.push(<span key="ip" className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">IP Default</span>);
    }
    return badges;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="text-blue-600" size={28} />
                Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage hospital information, departments and particulars</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Stats - Updated to 3 columns */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hospital</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.hospital_configured ? (
                      <span className="text-green-600">Configured</span>
                    ) : (
                      <span className="text-amber-600">Not Set</span>
                    )}
                  </p>
                </div>
                <Hospital className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_departments}</p>
                </div>
                <Building className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Particulars</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_particulars}</p>
                </div>
                <Tag className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Added Hospital tab */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('hospital')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'hospital' 
                  ? 'border-purple-600 text-purple-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hospital size={18} />
                Hospital
              </div>
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'departments' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building size={18} />
                Departments
              </div>
            </button>
            <button
              onClick={() => setActiveTab('particulars')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'particulars' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag size={18} />
                Particulars
              </div>
            </button>
          </div>
        </div>

        {/* Hospital Tab */}
        {activeTab === 'hospital' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hospital Information</h2>
              {stats.hospital_configured && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                  <Check size={14} />
                  Configured
                </span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={hospitalSettings.name}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, name: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., MY HOSPITAL NAME"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number(s) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={hospitalSettings.phone}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, phone: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 8888888888, 202574, 2218153"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hospitalSettings.address}
                  onChange={(e) => setHospitalSettings({...hospitalSettings, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., MY HOSPITAL ADDRESS"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={hospitalSettings.email}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="info@hospital.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={hospitalSettings.website}
                      onChange={(e) => setHospitalSettings({...hospitalSettings, website: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="www.hospital.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Note (Optional)
                </label>
                <textarea
                  value={hospitalSettings.footer_note}
                  onChange={(e) => setHospitalSettings({...hospitalSettings, footer_note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Thank you for visiting..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={loadData}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHospital}
                  disabled={isSavingHospital}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingHospital ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {isSavingHospital ? 'Saving...' : 'Save Hospital Settings'}
                </button>
              </div>

              {/* Preview Card */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-100">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{hospitalSettings.name || 'Hospital Name'}</h1>
                    <p className="text-gray-600 mt-1">{hospitalSettings.address || 'Address'}</p>
                    <p className="text-gray-600">Phone: {hospitalSettings.phone || 'Phone numbers'}</p>
                    {hospitalSettings.email && <p className="text-gray-600">Email: {hospitalSettings.email}</p>}
                    {hospitalSettings.website && <p className="text-gray-600">{hospitalSettings.website}</p>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
                    {hospitalSettings.footer_note || 'Footer note will appear here'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is how your hospital information will appear on bills and documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Departments</h2>
              <button
                onClick={() => setShowDeptForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Add Department
              </button>
            </div>

            {departments.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No departments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900">{dept.name}</div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(dept.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Particulars Tab */}
        {activeTab === 'particulars' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Particulars</h2>
              <button
                onClick={() => setShowParticularForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Add Particular
              </button>
            </div>

            {particulars.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No particulars yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {particulars.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{part.name}</div>
                      <div className="flex items-center gap-2 mb-1">
                        {getDefaultBadge(part)}
                        {part.sortorder > -1 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            Sort Order: {part.sortorder}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(part.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteParticular(part.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Department Form Modal */}
        {showDeptForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Add Department</h3>
                  <button onClick={() => setShowDeptForm(false)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department name"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeptForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDepartment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Particular Form Modal */}
        {showParticularForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Add Particular</h3>
                  <button onClick={() => setShowParticularForm(false)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Particular Name *</label>
                  <input
                    type="text"
                    value={newParticularName}
                    onChange={(e) => setNewParticularName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter particular name"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Default Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={newParticularOpDefault}
                            onChange={(e) => setNewParticularOpDefault(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border rounded transition-colors ${
                            newParticularOpDefault ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {newParticularOpDefault && <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">OP Default</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={newParticularIpDefault}
                            onChange={(e) => setNewParticularIpDefault(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border rounded transition-colors ${
                            newParticularIpDefault ? 'bg-green-600 border-green-600' : 'border-gray-300'
                          }`}>
                            {newParticularIpDefault && <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">IP Default</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={newParticularSortOrder}
                      onChange={(e) => setNewParticularSortOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="-1 for default"
                      min="-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first. Use -1 for default sorting.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowParticularForm(false);
                      setNewParticularName('');
                      setNewParticularOpDefault(false);
                      setNewParticularIpDefault(false);
                      setNewParticularSortOrder(-1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddParticular}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Particular
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;