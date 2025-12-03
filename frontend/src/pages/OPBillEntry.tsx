import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Save, Trash2, X, Printer, Search, Building, CalendarClock, User, Stethoscope, Shield, FileText, IndianRupee, Calculator, Percent, Users, MapPin, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface BillItem {
  particular: string
  doctor: string
  department: string
  unit: number
  rate: number
  discount_percent: number
  discount_amount: number
  total: number
}

interface Doctor {
  id: number
  name: string
}

interface Patient {
  id: number
  name: string
  house: string
  street: string
  place: string
  age: string
  gender: string
  op_number: string
  ip_number?: string
  phone?: string
  email?: string
}

const OPBillEntry = () => {
  const navigate = useNavigate()
  const [currentTime] = useState(new Date())
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const [formData, setFormData] = useState({
    patient_id: 0,
    op_number: '',
    bill_type: 'Cash',
    category: 'General',
    doctor_id: 0,
    discount_type: 'None'
  })
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [billItems, setBillItems] = useState<BillItem[]>([
    {
      particular: 'Consultation',
      doctor: '',
      department: 'OPD',
      unit: 1,
      rate: 0,
      discount_percent: 0,
      discount_amount: 0,
      total: 0
    }
  ])

  useEffect(() => {
    setIsLoading(false)
    fetchDoctors()
    fetchPatients()
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

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/patients', { params: { is_op: true } })
      setPatients(response.data)
    } catch (error) {
      toast.error('Failed to load patients')
    }
  }

  const generateBillNumber = () => {
    const now = new Date()
    const dateStr = format(now, 'yyyyMMdd')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `OP${dateStr}-${random}`
  }

  const handleSearchPatient = async (opNumber: string) => {
    if (!opNumber.trim()) {
      toast.error('Please enter OP number')
      return
    }

    setIsSearching(true)
    try {
      const patient = patients.find(p => p.op_number === opNumber)
      
      if (patient) {
        setSelectedPatient(patient)
        setFormData(prev => ({
          ...prev,
          patient_id: patient.id,
          op_number: patient.op_number
        }))
        toast.success('Patient found successfully')
      } else {
        toast.error('Patient not found. Please check OP number.')
      }
    } catch (error) {
      toast.error('Error searching for patient')
    } finally {
      setIsSearching(false)
    }
  }

  const handleBillItemChange = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...billItems]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'rate' || field === 'unit' || field === 'discount_percent') {
      const item = newItems[index]
      const amount = item.unit * item.rate
      const discount = amount * (item.discount_percent / 100)
      item.discount_amount = discount
      item.total = amount - discount
    }
    
    setBillItems(newItems)
  }

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      {
        particular: '',
        doctor: '',
        department: '',
        unit: 1,
        rate: 0,
        discount_percent: 0,
        discount_amount: 0,
        total: 0
      }
    ])
  }

  const removeBillItem = (index: number) => {
    if (billItems.length > 1) {
      const newItems = billItems.filter((_, i) => i !== index)
      setBillItems(newItems)
    }
  }

  const calculateTotals = () => {
    const totalAmount = billItems.reduce((sum, item) => sum + (item.unit * item.rate), 0)
    const totalDiscount = billItems.reduce((sum, item) => sum + item.discount_amount, 0)
    const netAmount = totalAmount - totalDiscount
    
    return { totalAmount, totalDiscount, netAmount }
  }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
    
  //   if (!selectedPatient) {
  //     toast.error('Please select a patient')
  //     return
  //   }
    
  //   if (!formData.doctor_id) {
  //     toast.error('Please select a doctor')
  //     return
  //   }
    
  //   const { netAmount } = calculateTotals()
    
  //   if (netAmount <= 0) {
  //     toast.error('Total amount must be greater than 0')
  //     return
  //   }
    
  //   setIsLoading(true)
    
  //   try {
  //     const billData = {
  //       patient_id: selectedPatient.id,
  //       bill_type: formData.bill_type,
  //       category: formData.category,
  //       doctor_id: formData.doctor_id,
  //       discount_type: formData.discount_type,
  //       items: billItems.map(item => ({
  //         particular: item.particular,
  //         doctor: item.doctor,
  //         department: item.department,
  //         unit: item.unit,
  //         rate: item.rate,
  //         discount_percent: item.discount_percent
  //       }))
  //     }
      
  //     const response = await axios.post('/bills/op', billData)
  //     toast.success(`OP Bill created successfully: ${response.data.bill_number}`)
      
  //     // Reset form
  //     setFormData({
  //       patient_id: 0,
  //       op_number: '',
  //       bill_type: 'Cash',
  //       category: 'General',
  //       doctor_id: doctors[0]?.id || 0,
  //       discount_type: 'None'
  //     })
  //     setSelectedPatient(null)
  //     setBillItems([{
  //       particular: 'Consultation',
  //       doctor: '',
  //       department: 'OPD',
  //       unit: 1,
  //       rate: 0,
  //       discount_percent: 0,
  //       discount_amount: 0,
  //       total: 0
  //     }])
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.detail || 'Failed to create bill')
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handlePrint = () => {
    window.print()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to clear this bill?')) {
      setFormData({
        patient_id: 0,
        op_number: '',
        bill_type: 'Cash',
        category: 'General',
        doctor_id: doctors[0]?.id || 0,
        discount_type: 'None'
      })
      setSelectedPatient(null)
      setBillItems([{
        particular: 'Consultation',
        doctor: '',
        department: 'OPD',
        unit: 1,
        rate: 0,
        discount_percent: 0,
        discount_amount: 0,
        total: 0
      }])
      toast.success('Bill cleared successfully')
    }
  }

  const { totalAmount, totalDiscount, netAmount } = calculateTotals()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Building className="mr-3" size={32} />
              Outpatient (OP) Bill Entry
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Create consultation and treatment bills for outpatients</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors flex items-center"
          >
            <X size={20} className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Bill Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Bill Number</p>
                <p className="text-2xl font-bold text-white mt-1">{generateBillNumber()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <CalendarClock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Bill Date & Time</p>
                <p className="text-lg font-bold text-white mt-1">
                  {format(new Date(), 'dd/MM/yyyy')} • {format(currentTime, 'HH:mm:ss')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <User className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Current Status</p>
                <p className="text-lg font-bold text-white mt-1">
                  {selectedPatient ? 'Patient Selected' : 'Search Patient'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <IndianRupee className="text-white" size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Net Amount</p>
                <p className="text-2xl font-bold text-white mt-1">₹{netAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Search className="mr-3 text-blue-600" size={24} />
            Patient Search & Details
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* OP Number Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="mr-2 text-blue-600" size={20} />
              Search Outpatient
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
                    value={formData.op_number}
                    onChange={(e) => setFormData({ ...formData, op_number: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter OP number (e.g., OP202512-000618)"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleSearchPatient(formData.op_number)}
                  disabled={isSearching}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={20} className="mr-2" />
                      Search Patient
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Patient Details Card */}
          {selectedPatient && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <User className="mr-2 text-green-600" size={20} />
                  Patient Details
                </h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  OP Patient
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Age / Gender</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.age} • {selectedPatient.gender}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">OP Number</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.op_number}</p>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <MapPin className="mr-1" size={14} />
                    Address
                  </label>
                  <p className="text-gray-900">
                    {[selectedPatient.house, selectedPatient.street, selectedPatient.place]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
                {(selectedPatient.phone || selectedPatient.email) && (
                  <div className="md:col-span-3 flex flex-wrap gap-4">
                    {selectedPatient.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedPatient.phone}</span>
                      </div>
                    )}
                    {selectedPatient.email && (
                      <div className="flex items-center space-x-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedPatient.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bill Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Stethoscope className="mr-2 text-purple-600" size={20} />
              Bill Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Bill Type *
                </label>
                <select
                  value={formData.bill_type}
                  onChange={(e) => setFormData({ ...formData, bill_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="General">General Consultation</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Review">Review</option>
                  <option value="Specialty">Specialty Consultation</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Consulting Doctor *
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Doctor</option>
                  {Array.isArray(doctors) && doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Discount Type
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="None">No Discount</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Staff">Hospital Staff</option>
                  <option value="Student">Student</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bill Items Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="mr-2 text-red-600" size={20} />
                Bill Items & Charges
              </h3>
              <button
                type="button"
                onClick={addBillItem}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-md flex items-center"
              >
                <FileText size={18} className="mr-2" />
                Add Bill Item
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      SL No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Particular
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Rate (₹)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Percent size={14} className="mr-1" />
                        Disc %
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Disc Amt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Total (₹)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-center font-medium text-gray-900 bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center mx-auto">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.particular}
                          onChange={(e) => handleBillItemChange(index, 'particular', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Consultation, Medicine"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.doctor}
                          onChange={(e) => handleBillItemChange(index, 'doctor', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Doctor name"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.department}
                          onChange={(e) => handleBillItemChange(index, 'department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Department"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.unit}
                          onChange={(e) => handleBillItemChange(index, 'unit', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleBillItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-center font-medium text-gray-900">
                          ₹{(item.unit * item.rate).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={item.discount_percent}
                          onChange={(e) => handleBillItemChange(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          max="100"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-center font-medium text-gray-900">
                          ₹{item.discount_amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="px-3 py-2 bg-blue-50 rounded-lg text-center font-bold text-blue-900">
                          ₹{item.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {billItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBillItem(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          {formData.bill_type === 'Insurance' && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <Shield className="mr-2 text-yellow-600" size={20} />
                Insurance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Insurance Company
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter insurance company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter policy number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center mb-6">
              <Calculator className="mr-2 text-green-600" size={20} />
              Bill Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="text-xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount:</span>
                  <span className="text-xl font-bold text-red-600">-₹{totalDiscount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Bill Type:</span>
                  <span className="text-lg font-semibold text-gray-900">{formData.bill_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Category:</span>
                  <span className="text-lg font-semibold text-gray-900">{formData.category}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Consulting Doctor:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {doctors.find(d => d.id === formData.doctor_id)?.name || 'Not selected'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 p-4 bg-white rounded-xl border border-green-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Net Amount:</span>
                  <span className="text-2xl font-bold text-green-700">₹{netAmount.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Total payable amount
                </div>
              </div>
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
                Clear Bill
              </button>
              
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 border border-blue-300 text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition-colors flex items-center"
              >
                <Printer size={18} className="mr-2" />
                Print Preview
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center"
              >
                <Save size={18} className="mr-2" />
                {isLoading ? 'Saving Bill...' : 'Save OP Bill'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OPBillEntry