import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Users, 
  UserPlus, 
  Stethoscope, 
  FileText, 
  ClipboardList,
  LogOut,
  Menu,
  X,
  Building,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Shield,
  CreditCard
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Overview & analytics',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      path: '/patient/registration', 
      label: 'Patient Registration', 
      icon: UserPlus,
      description: 'OP & IP registration',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      path: '/doctor/master', 
      label: 'Doctor Master', 
      icon: Stethoscope,
      description: 'Manage doctors',
      color: 'from-purple-500 to-indigo-500'
    },
    { 
      path: '/billing/op', 
      label: 'OP Billing', 
      icon: FileText,
      description: 'Outpatient billing',
      color: 'from-orange-500 to-amber-500'
    },
    { 
      path: '/billing/ip', 
      label: 'IP Billing', 
      icon: ClipboardList,
      description: 'Inpatient billing',
      color: 'from-red-500 to-pink-500'
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: BarChart3,
      description: 'Analytics & reports',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      path: '/appointments', 
      label: 'Appointments', 
      icon: Calendar,
      description: 'Schedule management',
      color: 'from-teal-500 to-green-500'
    },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsSidebarOpen(true)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity duration-300"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                <button onClick={() => setIsNotificationsOpen(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            {/* Notifications content would go here */}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-blue-900 to-indigo-900 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 lg:flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-8 border-b border-blue-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Building className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">HMS Pro</h1>
                <p className="text-blue-200 text-sm">Hospital Management System</p>
              </div>
            </div>
            <div className="bg-blue-800/50 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-blue-100 text-sm">License: Professional</p>
              <p className="text-blue-200 text-xs">Version 2.0.1</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <div className="px-4 mb-6">
              <p className="text-blue-300 text-sm font-medium uppercase tracking-wider">MAIN NAVIGATION</p>
            </div>
            
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full group flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} shadow-lg transform scale-[1.02]` 
                      : 'hover:bg-white/10 hover:transform hover:scale-[1.02]'
                    }
                  `}
                >
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    <Icon size={20} className={isActive ? 'text-white' : 'text-blue-300'} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${isActive ? 'text-white' : 'text-blue-100'}`}>
                      {item.label}
                    </p>
                    <p className={`text-sm ${isActive ? 'text-white/90' : 'text-blue-300/70'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={16} className={isActive ? 'text-white' : 'text-blue-300'} />
                </button>
              )
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="p-6 border-t border-blue-800">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-blue-900"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{user?.full_name}</p>
                <p className="text-blue-200 text-sm">Receptionist/Admin</p>
                <p className="text-blue-300 text-xs mt-1">
                  Last login: Today, {format(new Date(), 'hh:mm a')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-blue-100 rounded-xl transition-colors">
                <Settings size={18} />
                <span className="font-medium">Settings</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-blue-100 rounded-xl transition-colors">
                <HelpCircle size={18} />
                <span className="font-medium">Help & Support</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all shadow-md"
              >
                <LogOut size={18} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-blue-800">
              <p className="text-blue-300 text-xs text-center">
                © 2024 HMS Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all shadow-sm"
              >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="hidden lg:block">
                <h2 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {getGreeting()}, {user?.full_name?.split(' ')[0]}! Welcome back.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Quick Stats */}
              <div className="hidden xl:flex items-center space-x-6">
                <div className="text-center px-4">
                  <p className="text-sm text-gray-600">Today's OPs</p>
                  <p className="text-lg font-bold text-blue-600">24</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-sm text-gray-600">Today's IPs</p>
                  <p className="text-lg font-bold text-purple-600">8</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-lg font-bold text-green-600">₹45,820</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all relative"
                >
                  <Bell size={20} className="text-gray-700" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                <button className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all">
                  <Shield size={20} className="text-blue-600" />
                </button>
                
                <div className="hidden lg:flex items-center space-x-4 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-600">Admin Access</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="px-8 pb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Home size={16} className="mr-2" />
              <ChevronRight size={16} className="mx-2" />
              <span className="text-gray-900 font-medium">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </span>
              <ChevronRight size={16} className="mx-2" />
              <span className="text-gray-500">
                {format(new Date(), 'dd MMMM yyyy')}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  System Status: <span className="text-green-600 font-medium">● Online</span>
                </p>
                <p className="text-sm text-gray-600">
                  Server Load: <span className="text-blue-600 font-medium">24%</span>
                </p>
                <p className="text-sm text-gray-600">
                  Last Backup: <span className="text-gray-900 font-medium">2 hours ago</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout