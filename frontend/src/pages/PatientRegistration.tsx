import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Save, X, Search, Trash2, User, Phone, MapPin, CalendarClock, Building, FileText, UserCheck, Home, Clock, Users, Eye, Loader2, Bed, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Doctor {
  id: number
  name: string
  code: string
}

interface Patient {
  id: number
  patient_number: string
  name: string
  age: string
  gender: 'Male' | 'Female' | 'Other'
  complaint: string
  phone: string
  doctor_id: number
  doctor_name?: string
  registration_date?: string
  is_ip: boolean
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
  const [searchParams, setSearchParams] = useSearchParams()
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
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientList, setShowPatientList] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientNumber, setPatientNumber] = useState<string>('')

  useEffect(() => {
    fetchDoctors()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    generateNewPatientNumber()
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      is_ip: isIP,
      room: isIP ? prev.room : ''
    }))
    
    generateNewPatientNumber()
    setSelectedPatient(null)
    setShowPatientList(false)
    setPatients([])
    
    toast.success(`Switched to ${isIP ? 'IP' : 'OP'} registration`)
  }, [isIP])

  const generatePatientNumber = (): string => {
    const now = new Date()
    const yearMonth = format(now, 'yyyyMM')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return isIP
      ? `IP-${yearMonth}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      : `OP-${yearMonth}-${random}`
  }

  const generateNewPatientNumber = () => {
    setPatientNumber(generatePatientNumber())
  }

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

  const toggleRegistrationType = () => {
    const newType = isIP ? 'op' : 'ip'
    setSearchParams({ type: newType })
  }

  const fetchAllPatients = async () => {
    console.log('Fetching all patients...')
    setIsSearching(true)
    try {
      const response = await axios.get('/patients')
      console.log('All patients response:', response.data)
      setPatients(response.data)
      setShowPatientList(true)
      toast.success(`Showing ${response.data.length} patients`)
    } catch (error: any) {
      console.error('Error fetching all patients:', error)
      toast.error('Failed to load patients')
      setPatients([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleShowAllPatients = async () => {
    console.log('Show All button clicked, showPatientList:', showPatientList)
    if (showPatientList) {
      setShowPatientList(false)
    } else {
      await fetchAllPatients()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.age || !formData.gender || !formData.complaint || !formData.phone || !formData.doctor_id) {
      toast.error('Please fill required fields')
      return
    }

    if (isIP && !formData.room) {
      toast.error('Room/Ward is required for inpatient registration')
      return
    }

    setIsLoading(true)

    try {
      const patientData = {
        ...formData,
        patient_number: patientNumber,
        registration_date: format(new Date(), 'yyyy-MM-dd'),
        registration_time: format(currentTime, 'HH:mm:ss')
      }

      console.log('Submitting patient data:', patientData)

      await axios.post('/patients', patientData)

      toast.success(`Patient registered successfully! ${isIP ? 'IP' : 'OP'} Number: ${patientNumber}`)

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
      setSearchTerm('')
      setSelectedPatient(null)
      generateNewPatientNumber()

      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Invalid data. Please check all fields.')
      } else if (error.response?.status === 409) {
        toast.error('Patient with similar details already exists')
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        navigate('/login')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchPatients = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter search term')
      return
    }

    setIsSearching(true)
    try {
      const response = await axios.get(`/patients/search?query=${searchTerm}`)
      setPatients(response.data)
      setShowPatientList(true)
      toast.success(`Found ${response.data.length} patients`)
    } catch (error) {
      toast.error('Failed to search patients')
      setPatients([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      complaint: patient.complaint,
      house: '',
      street: '',
      place: '',
      phone: patient.phone,
      doctor_id: patient.doctor_id,
      referred_by: '',
      room: '',
      is_ip: isIP
    })
    setShowPatientList(false)
    toast.success(`Loaded data for ${patient.name}`)
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
      setSearchTerm('')
      setSelectedPatient(null)
      setPatients([])
      setShowPatientList(false)
      generateNewPatientNumber()
      toast.success('Form cleared successfully')
    }
  }

  const handleViewPatient = (patientId: number) => {
    navigate(`/patients/${patientId}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r rounded-2xl p-8 shadow-xl ${isIP ? 'from-purple-600 to-indigo-700' : 'from-blue-600 to-cyan-700'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Building className="mr-3" size={32} />
              {isIP ? 'Inpatient (IP) Registration' : 'Outpatient (OP) Registration'}
            </h1>
            <p className="text-white/80 mt-2 text-lg">
              {isIP ? 'Register new inpatient admissions' : 'Register new outpatient consultations'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={toggleRegistrationType}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${isIP 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'}`}
            >
              {isIP ? (
                <>
                  <Stethoscope size={20} className="mr-2" />
                  Switch to OP Registration
                </>
              ) : (
                <>
                  <Bed size={20} className="mr-2" />
                  Switch to IP Registration
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors flex items-center"
            >
              <X size={20} className="mr-2" />
              Back to Dashboard
            </button>
          </div>
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
                <p className="text-2xl font-bold text-white mt-1">{patientNumber}</p>
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
              <div className={`p-3 ${isIP ? 'bg-purple-500' : 'bg-blue-500'} rounded-lg mr-4`}>
                <UserCheck className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Registration Type</p>
                <p className={`text-lg font-bold ${isIP ? 'text-purple-200' : 'text-blue-200'} mt-1`}>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <User className="mr-3 text-blue-600" size={24} />
              Patient Information
            </h2>

            {/* Search Patients Section */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchPatients()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  placeholder="Search by name, phone, or number..."
                />
              </div>
              <button
                type="button"
                onClick={handleSearchPatients}
                disabled={isSearching}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Search size={18} className="mr-2" />
                )}
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Direct onClick called')
                  handleShowAllPatients()
                }}
                disabled={isSearching}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Users size={18} className="mr-2" />
                )}
                {showPatientList ? 'Hide List' : 'Show All'}
              </button>
            </div>
          </div>
        </div>

        {/* Patient List Modal/Overlay */}
        {showPatientList && (
          <div className="px-6 pt-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="mr-2" size={20} />
                  {searchTerm ? 'Search Results' : 'All Patients'}
                </h3>
                <button
                  onClick={() => setShowPatientList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {patients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto mb-3" size={40} />
                  <p>No patients found. {searchTerm ? 'Try a different search term.' : 'No patients in the system yet.'}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${patient.is_ip ? 'bg-purple-500' : 'bg-blue-500'}`} />
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {patient.patient_number}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <span className="mr-4">Age: {patient.age}</span>
                              <span className="mr-4">Gender: {patient.gender}</span>
                              <span>Phone: {patient.phone}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              Complaint: {patient.complaint}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSelectPatient(patient)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Use for {isIP ? 'IP' : 'OP'}
                        </button>
                        <button
                          onClick={() => handleViewPatient(patient.id)}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Patient Info */}
        {selectedPatient && (
          <div className="px-6 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCheck className="text-green-600 mr-3" size={20} />
                  <div>
                    <h3 className="font-semibold text-green-900">
                      Using data from: {selectedPatient.name}
                    </h3>
                    <p className="text-sm text-green-700">
                      {selectedPatient.patient_number} • {selectedPatient.age} • {selectedPatient.gender}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null)
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
                  }}
                  className="text-green-700 hover:text-green-900 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                    Room/Ward *
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ICU-101, Ward-2A"
                    required={isIP}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-6 border-t">
            <div className="text-sm text-gray-600">
              {selectedPatient ? (
                <span className="text-green-600 font-semibold">
                  Using data from existing patient: {selectedPatient.name}
                </span>
              ) : (
                <>
                  Logged in as: <span className="font-semibold text-gray-900">Hospital Staff</span>
                </>
              )}
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
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Save size={18} className="mr-2" />
                )}
                {isLoading ? 'Registering...' : `Register as ${isIP ? 'IP' : 'OP'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientRegistration