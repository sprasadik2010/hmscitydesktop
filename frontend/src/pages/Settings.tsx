import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Building, Tag, X, RefreshCw } from 'lucide-react';
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
  created_at: string;
}

const SettingsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [particulars, setParticulars] = useState<Particular[]>([]);
  const [activeTab, setActiveTab] = useState<'departments' | 'particulars'>('departments');
  const [isLoading, setIsLoading] = useState(true);
  
  // Forms
  const [newDeptName, setNewDeptName] = useState('');
  const [showDeptForm, setShowDeptForm] = useState(false);
  
  const [newParticularName, setNewParticularName] = useState('');
  // REMOVED: const [selectedDeptId, setSelectedDeptId] = useState<number>(0);
  const [showParticularForm, setShowParticularForm] = useState(false);
  
  const [stats, setStats] = useState({
    total_departments: 0,
    total_particulars: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptsRes, partsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/settings/departments`),
        axios.get(`${API_BASE_URL}/settings/particulars`),
        axios.get(`${API_BASE_URL}/settings/stats`)
      ]);

      setDepartments(deptsRes.data);
      setParticulars(partsRes.data);
      setStats(statsRes.data);
      
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

    // REMOVED: Department selection validation
    // if (selectedDeptId === 0) {
    //   toast.error('Please select a department');
    //   return;
    // }

    try {
      const response = await axios.post(`${API_BASE_URL}/settings/particulars`, {
        name: newParticularName
        // REMOVED: department_id: selectedDeptId
      });
      
      setParticulars([...particulars, response.data]);
      setNewParticularName('');
      // REMOVED: setSelectedDeptId(0);
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
              <p className="text-gray-600 mt-1">Manage departments and particulars</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'departments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              <div className="flex items-center gap-2">
                <Building size={18} />
                Departments
              </div>
            </button>
            <button
              onClick={() => setActiveTab('particulars')}
              className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'particulars' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              <div className="flex items-center gap-2">
                <Tag size={18} />
                Particulars
              </div>
            </button>
          </div>
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Departments</h2>
              <button
                onClick={() => setShowDeptForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <div key={dept.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-gray-900">{dept.name}</div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(dept.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                  <div key={part.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-gray-900">{part.name}</div>
                      <div className="text-sm text-gray-500">
                        {/* REMOVED: Department display */}
                        Created: {new Date(part.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteParticular(part.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                  <button onClick={() => setShowDeptForm(false)} className="p-1 hover:bg-gray-100 rounded">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter department name"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeptForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDepartment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <button onClick={() => setShowParticularForm(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Particular Name</label>
                  <input
                    type="text"
                    value={newParticularName}
                    onChange={(e) => setNewParticularName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter particular name"
                  />
                </div>
                {/* REMOVED: Department selection */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowParticularForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddParticular}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save
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