import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Save, X, Search, Trash2, User, Phone, MapPin, CalendarClock, Building, FileText, UserCheck, Home, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Doctor {
  id: number
  name: string
  code: string
}

interface PatientFormData {
  name: string
  age: string
  gender: 'Male' | 'Female' | 'Other'
  complaint: string
  house: string
  street: string
  place: string
  phone: string
  doctor_id: number
  referred_by: string
  room: string
  is_ip: boolean
}

const PatientRegistration = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'op'
  const isIP = type === 'ip'
  
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: 'Male',
    complaint: '',
    house: '',
    street: '',
    place: '',
    phone: '',
    doctor_id: 0,
    referred_by: '',
    room: '',
    is_ip: isIP
  })
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [opNumber, setOpNumber] = useState('')
  // const [showPatientSearch, setShowPatientSearch] = useState(false)

  useEffect(() => {
    setIsLoading(false)
    fetchDoctors()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors')
      setDoctors(response.data)
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, doctor_id: response.data[0].id }))
      }
    } catch (error) {
      toast.error('Failed to load doctors')
    }
  }

  const generatePatientNumber = () => {
    const now = new Date()
    const yearMonth = format(now, 'yyyyMM')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return isIP 
      ? `${yearMonth}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      : `${yearMonth}-${random}`
  }

  const handleSearchOP = async () => {
    if (!opNumber.trim()) {
      toast.error('Please enter OP number')
      return
    }

    try {
      const response = await axios.get(`/patients/search/op/${opNumber}`)
      const patient = response.data
      
      setFormData({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        complaint: patient.complaint,
        house: patient.house,
        street: patient.street,
        place: patient.place,
        phone: patient.phone,
        doctor_id: patient.doctor_id,
        referred_by: patient.referred_by || '',
        room: patient.room || '',
        is_ip: isIP
      })
      
      toast.success('Patient data loaded successfully')
    } catch (error) {
      toast.error('Patient not found')
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to clear this form?')) {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        complaint: '',
        house: '',
        street: '',
        place: '',
        phone: '',
        doctor_id: doctors[0]?.id || 0,
        referred_by: '',
        room: '',
        is_ip: isIP
      })
      setOpNumber('')
      toast.success('Form cleared successfully')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r rounded-2xl p-8 shadow-xl ${isIP ? 'from-purple-600 to-indigo-700' : 'from-blue-600 to-cyan-700'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Building className="mr-3" size={32} />
              {isIP ? 'Inpatient (IP) Registration' : 'Outpatient (OP) Registration'}
            </h1>
            <p className="text-white/80 mt-2 text-lg">
              {isIP ? 'Register new inpatient admissions' : 'Register new outpatient consultations'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors flex items-center"
          >
            <X size={20} className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Registration Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">{isIP ? 'IP Number' : 'OP Number'}</p>
                <p className="text-2xl font-bold text-white mt-1">{generatePatientNumber()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <CalendarClock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Registration Date</p>
                <p className="text-lg font-bold text-white mt-1">{format(new Date(), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Registration Time</p>
                <p className="text-lg font-bold text-white mt-1">{format(currentTime, 'HH:mm:ss')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <UserCheck className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Registration Type</p>
                <p className="text-lg font-bold text-white mt-1">
                  {isIP ? 'INPATIENT' : 'OUTPATIENT'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <User className="mr-3 text-blue-600" size={24} />
            Patient Information
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* OP Number Search (Only for IP Registration) */}
          {isIP && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Search className="mr-2 text-blue-600" size={20} />
                Search Existing Patient
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    OP Number *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={opNumber}
                      onChange={(e) => setOpNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter existing OP number (e.g., 202512-001)"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSearchOP}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md flex items-center justify-center"
                  >
                    <Search size={20} className="mr-2" />
                    Search Patient
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="mr-2 text-purple-600" size={20} />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Age *
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 30 years, 6 months, 7 days"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Gender *
                </label>
                <div className="flex space-x-4 mt-2">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === gender}
                        onChange={() => setFormData({ ...formData, gender: gender as any })}
                        className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="text-gray-900">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-3 space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Complaint (C/O) *
                </label>
                <textarea
                  value={formData.complaint}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the patient's complaint"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="mr-2 text-green-600" size={20} />
              Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 flex items-center">
                  <Home className="mr-1" size={14} />
                  House/Flat No.
                </label>
                <input
                  type="text"
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="House number"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Street
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Street name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Place *
                </label>
                <input
                  type="text"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City/Town"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact & Medical Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="mr-2 text-blue-600" size={20} />
              Contact & Medical Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Consulting Doctor *
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Doctor</option>
                  {Array.isArray(doctors) && doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} ({doctor.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Referred By
                </label>
                <input
                  type="text"
                  value={formData.referred_by}
                  onChange={(e) => setFormData({ ...formData, referred_by: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Referring doctor/clinic"
                />
              </div>
              
              {isIP && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Room/Ward
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ICU-101, Ward-2A"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-6 border-t">
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-semibold text-gray-900">Hospital Staff</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 border border-red-300 text-red-700 font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center"
              >
                <Trash2 size={18} className="mr-2" />
                Clear Form
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center"
              >
                <X size={18} className="mr-2" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center ${isIP ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'}`}
              >
                <Save size={18} className="mr-2" />
                {isLoading ? 'Registering...' : `Register as ${isIP ? 'IP' : 'OP'}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientRegistration