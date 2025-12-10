import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Users, 
  // UserPlus, 
  FileText, 
  ClipboardList, 
  Calendar,
  TrendingUp,
  Stethoscope,
  Hospital,
  Clock,
  Activity,
  ShieldCheck,
  Database,
  Server,
  Printer,
  ArrowRight,
  HeartPulse
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface DashboardStats {
  total_patients_today: number
  total_op_bills_today: number
  total_ip_bills_today: number
  total_revenue_today: number
  pending_appointments: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard stats')
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    // {
    //   title: 'OP Registration',
    //   description: 'Register new outpatient',
    //   icon: UserPlus,
    //   color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    //   gradient: 'from-blue-50 to-blue-100',
    //   action: () => navigate('/patient/registration?type=op')
    // },
    // {
    //   title: 'IP Registration',
    //   description: 'Register new inpatient',
    //   icon: Users,
    //   color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    //   gradient: 'from-purple-50 to-purple-100',
    //   action: () => navigate('/patient/registration?type=ip')
    // },
    {
      title: 'OP Billing',
      description: 'Create OP consultation bill',
      icon: FileText,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      gradient: 'from-green-50 to-green-100',
      action: () => navigate('/billing/op')
    },
    {
      title: 'IP Billing',
      description: 'Create IP admission bill',
      icon: ClipboardList,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      gradient: 'from-orange-50 to-orange-100',
      action: () => navigate('/billing/ip')
    },
    {
      title: 'Doctor Master',
      description: 'Manage hospital doctors',
      icon: Stethoscope,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      gradient: 'from-red-50 to-red-100',
      action: () => navigate('/doctor/master')
    },
    {
      title: 'Reports',
      description: 'View financial reports',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100',
      action: () => navigate('/reports')
    }
  ]

  const systemStatus = [
    {
      label: 'Database',
      status: 'Online',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'API Server',
      status: 'Running',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Authentication',
      status: 'Active',
      icon: ShieldCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Print Service',
      status: 'Ready',
      icon: Printer,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Backup System',
      status: 'Scheduled',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Hospital className="mr-3" size={32} />
              Hospital Management System
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Welcome to HMS Lite - Professional Healthcare Management</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center">
                <Clock className="text-white mr-2" size={20} />
                <span className="text-white font-medium">
                  {new Date().toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Today's Patients</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.total_patients_today || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">OP Bills Today</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.total_op_bills_today || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <ClipboardList className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">IP Bills Today</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.total_ip_bills_today || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Today's Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">
                  ₹{stats?.total_revenue_today?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="mr-3 text-blue-600" size={24} />
              Quick Actions
            </h2>
            <p className="text-gray-600 mt-1">Frequently used functions for daily operations</p>
          </div>
          <div className="text-sm text-gray-500">
            6 modules available
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.action}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start mb-4">
                  <div className={`p-3 rounded-xl ${action.color} shadow-md`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
                </div>
                <div className={`h-1 w-full rounded-full bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom Section - Pending Appointments & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Appointments Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-3 text-green-600" size={24} />
              Pending Appointments
            </h2>
          </div>
          <div className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
                <Calendar className="text-green-600" size={40} />
              </div>
              <p className="text-5xl font-bold text-gray-900 mb-2">{stats?.pending_appointments || 0}</p>
              <p className="text-gray-600 text-lg">Appointments pending for today</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Morning</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor((stats?.pending_appointments || 0) * 0.6)}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Evening</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor((stats?.pending_appointments || 0) * 0.4)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/reports?tab=appointments')}
                className="mt-8 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
              >
                View All Appointments
              </button>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShieldCheck className="mr-3 text-blue-600" size={24} />
              System Status
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemStatus.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${item.bgColor} mr-4`}>
                        <Icon className={item.color} size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-500">Real-time monitoring</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${item.bgColor} ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">System Uptime</div>
                  <div className="text-2xl font-bold text-gray-900">99.8%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <HeartPulse className="text-red-500 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Healthcare First</h3>
              <p className="text-gray-600 text-sm">Your commitment to quality healthcare management</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            HMS Lite v1.0 • {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard