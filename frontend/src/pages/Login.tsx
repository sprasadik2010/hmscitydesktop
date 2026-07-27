import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Hospital, Lock, User, HeartPulse, Shield, Stethoscope, Building, Activity, UserPlus/*, Mail, Phone*/ } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserCheck {
  has_users: boolean;
  total_users: number;
}

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [hasUsers, setHasUsers] = useState<boolean | null>(null)
  const [checkingUsers, setCheckingUsers] = useState(true)
  
  // Registration form state
  const [regUsername, setRegUsername] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    checkExistingUsers()
  }, [])

  const checkExistingUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/check-users', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data: UserCheck = await response.json();
        setHasUsers(data.has_users);
      } else {
        // If endpoint doesn't exist, assume no users or handle error
        setHasUsers(false);
      }
    } catch (error) {
      console.error('Error checking users:', error);
      setHasUsers(false); // Default to showing registration if can't check
    } finally {
      setCheckingUsers(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!regUsername || !regFullName || !regPassword || !regConfirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: regUsername,
          full_name: regFullName,
          password: regPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      toast.success('Registration successful! You can now login.');
      
      // Clear registration form
      setRegUsername('')
      setRegFullName('')
      setRegPassword('')
      setRegConfirmPassword('')
      
      // Switch to login mode
      setHasUsers(true)
      
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Please enter both username and password')
      return
    }
    
    setIsLoading(true)
    
    try {
      await login(username, password)
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
  }

  const hospitalFeatures = [
    { icon: Stethoscope, text: 'OP/IP Patient Management', color: 'text-blue-600' },
    { icon: Building, text: 'Doctor & Staff Management', color: 'text-green-600' },
    { icon: Activity, text: 'Real-time Billing System', color: 'text-purple-600' },
    { icon: Shield, text: 'Secure & HIPAA Compliant', color: 'text-red-600' }
  ]

  if (checkingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Hospital Info (Always visible) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 lg:p-12 shadow-2xl">
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Hospital size={40} className="text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Patient Management System
              </h1>
              <p className="text-blue-100 text-lg mb-8">
                Professional patient management solution for modern hospitals
              </p>
              
              <div className="space-y-4 mb-8">
                {hospitalFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Icon className={`${feature.color} filter brightness-125`} size={24} />
                      </div>
                      <span className="text-white font-medium">{feature.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center">
                  <HeartPulse className="text-white mr-3" size={24} />
                  <div>
                    <p className="text-white font-semibold">Healthcare First</p>
                    <p className="text-blue-100 text-sm">Your commitment to quality patient care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Conditional Form */}
        <div className="flex flex-col justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                {!hasUsers || isRegistering ? (
                  <UserPlus size={28} className="text-white" />
                ) : (
                  <Lock size={28} className="text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {!hasUsers || isRegistering ? 'System Setup' : 'Secure Login'}
              </h2>
              <p className="text-gray-600 mt-2">
                {!hasUsers || isRegistering 
                  ? 'Create the first administrator account' 
                  : 'Access your patient management dashboard'}
              </p>
            </div>

            {!hasUsers || isRegistering ? (
              // Registration Form
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="reg-username" className="block text-sm font-medium text-gray-900">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="reg-username"
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Choose a username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-fullname" className="block text-sm font-medium text-gray-900">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="reg-fullname"
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="reg-password"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Create a password (min. 6 characters)"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-900">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="reg-confirm-password"
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus size={20} className="mr-2" />
                      Create Administrator Account
                    </span>
                  )}
                </button>

                {hasUsers && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all"
                    >
                      ← Back to Login
                    </button>
                  </div>
                )}
              </form>
            ) : (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Lock size={20} className="mr-2" />
                      Login to Dashboard
                    </span>
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all"
                  >
                    Need to setup a new account? Click here
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-600">
            <p className="text-sm">© {new Date().getFullYear()} PMS Lite - Professional Patient Management</p>
            <p className="text-sm mt-1">Version 1.0 • OP/IP Support • Secure & Compliant</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login