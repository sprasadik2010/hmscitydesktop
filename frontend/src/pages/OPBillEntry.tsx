import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { /* Save, Trash2, */ X, /* Printer, */ Search, Building, CalendarClock, User, /* Phone, Mail, Home, MapPin, Bed, IndianRupee, Eye, */ Loader2, Users, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface BillItem {
  particular: string
  doctor: string
  department: string
  unit: number
  rate: number
  amount: number
  discount_percent: number
  discount_amount: number
  total: number
}

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
  house: string
  street: string
  place: string
  email: string
  doctor_id: number
  doctor_name: string
  referred_by: string
  registration_date: string
  is_ip: boolean
}

interface PreviousBill {
  id: number
  bill_number: string
  bill_date: string
  total_amount: number
  discount_amount: number
  net_amount: number
  category: string
  patient_id: number
  doctor_id: number
}

interface BillDetails {
  bill: PreviousBill
  items: Array<{
    particular: string
    doctor: string
    department: string
    unit: number
    rate: number
    amount: number
    discount_percent: number
    discount_amount: number
    total: number
  }>
}

const OPBillEntry = () => {
  const navigate = useNavigate()
  const [currentTime] = useState(new Date())
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  // Previous bills states
  const [previousBills, setPreviousBills] = useState<PreviousBill[]>([])
  const [currentBillIndex, setCurrentBillIndex] = useState<number>(-1)
  const [isLoadingBills, setIsLoadingBills] = useState(false)
  const [showPreviousBills, setShowPreviousBills] = useState(false)
  const [isLoadingBillDetails, setIsLoadingBillDetails] = useState(false)
  
  // Patient Form Data
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    complaint: '',
    house: '',
    street: '',
    place: '',
    phone: '',
    email: '',
    doctor_id: 0,
    referred_by: ''
  })
  
  // Bill Form Data
  const [billFormData, setBillFormData] = useState({
    bill_type: 'Cash',
    category: 'General',
    payment_mode: 'Cash'
  })
  
  const [billItems, setBillItems] = useState<BillItem[]>([
    { particular: 'Consultation', doctor: '', department: 'OPD', unit: 1, rate: 0, amount: 0, discount_percent: 0, discount_amount: 0, total: 0 }
  ])

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors')
      setDoctors(response.data)
      if (response.data.length > 0) {
        setPatientFormData(prev => ({ ...prev, doctor_id: response.data[0].id }))
      }
    } catch (error) {
      toast.error('Failed to load doctors')
    }
  }

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter search term')
      return
    }

    setIsSearching(true)
    try {
      const response = await axios.get(`/patients/search/op/${encodeURIComponent(searchQuery)}`)
      const opPatients = response.data
      setPatients(opPatients)
      setShowSearchResults(true)
      toast.success(`Found ${opPatients.length} OP patients`)
    } catch (error) {
      toast.error('Failed to search patients')
      setPatients([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient)
    
    // Populate patient form
    setPatientFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      complaint: patient.complaint,
      house: patient.house,
      street: patient.street,
      place: patient.place,
      phone: patient.phone,
      email: patient.email || '',
      doctor_id: patient.doctor_id,
      referred_by: patient.referred_by || ''
    })
    
    // Reset previous bills navigation
    setPreviousBills([])
    setCurrentBillIndex(-1)
    setShowPreviousBills(false)
    
    // Load previous bills for this patient
    await fetchPreviousBills(patient.id)
    
    setShowSearchResults(false)
    setSearchQuery('')
    toast.success(`Patient ${patient.name} selected`)
  }

  const fetchPreviousBills = async (patientId: number) => {
    setIsLoadingBills(true)
    try {
      const response = await axios.get(`/bills/op/${patientId}`)
      // Sort bills by date (newest first)
      const sortedBills = response.data.sort((a: any, b: any) => 
        new Date(b.bill_date).getTime() - new Date(a.bill_date).getTime()
      )
      setPreviousBills(sortedBills)
      
      if (sortedBills.length > 0) {
        setShowPreviousBills(true)
        // Don't load any bill by default - start with blank form
        setCurrentBillIndex(-1)
        toast(`Found ${sortedBills.length} previous bill(s) for this patient`, {
          icon: 'ℹ️',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Failed to load previous bills:', error)
      // Don't show error toast if there are no bills
    } finally {
      setIsLoadingBills(false)
    }
  }

  const handleLoadPreviousBill = async (index: number) => {
    if (index < 0 || index >= previousBills.length) return
    
    const bill = previousBills[index]
    
    // Show confirmation before loading bill
    const confirmLoad = window.confirm(
      `Load bill ${bill.bill_number} from ${format(new Date(bill.bill_date), 'dd/MM/yyyy')}?\n` +
      `This will replace your current bill items.`
    )
    
    if (!confirmLoad) return
    
    try {
      setIsLoadingBillDetails(true)
      
      // Fetch complete bill details with items using your API
      const response = await axios.get(`/bills/op/details/${bill.id}`)
      const billDetails: BillDetails = response.data
      
      // Update current bill index
      setCurrentBillIndex(index)
      
      // Populate form with loaded bill data
      populateFormWithBill(billDetails)
      
      toast.success(`Bill ${bill.bill_number} loaded successfully`)
    } catch (error: any) {
      console.error('Error loading bill details:', error)
      toast.error('Failed to load bill details')
      setCurrentBillIndex(-1)
    } finally {
      setIsLoadingBillDetails(false)
    }
  }

  const populateFormWithBill = (billDetails: BillDetails) => {
    const { bill, items } = billDetails
    
    // Update bill form data
    setBillFormData({
      bill_type: 'Cash', // Your OP bills might not have this field
      category: bill.category || 'General',
      payment_mode: 'Cash'
    })
    
    // Update patient form data with doctor from bill
    if (selectedPatient) {
      setPatientFormData(prev => ({
        ...prev,
        doctor_id: bill.doctor_id || prev.doctor_id
      }))
    }
    
    // Update bill items
    const mappedItems: BillItem[] = items.map(item => ({
      particular: item.particular,
      doctor: item.doctor,
      department: item.department,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount,
      discount_percent: item.discount_percent,
      discount_amount: item.discount_amount,
      total: item.total
    }))
    
    // If no items, keep default items
    setBillItems(mappedItems.length > 0 ? mappedItems : [
      { particular: 'Consultation', doctor: '', department: 'OPD', unit: 1, rate: 0, amount: 0, discount_percent: 0, discount_amount: 0, total: 0 }
    ])
  }

  const handleNextBill = () => {
    if (currentBillIndex < previousBills.length - 1) {
      handleLoadPreviousBill(currentBillIndex + 1)
    }
  }

  const handlePrevBill = () => {
    if (currentBillIndex > 0) {
      handleLoadPreviousBill(currentBillIndex - 1)
    }
  }

  const handleClearCurrentBill = () => {
    setCurrentBillIndex(-1)
    // Reset bill form to default (keeping patient selected)
    setBillFormData({
      bill_type: 'Cash',
      category: 'General',
      payment_mode: 'Cash'
    })
    
    setBillItems([
      { particular: 'Consultation', doctor: '', department: 'OPD', unit: 1, rate: 0, amount: 0, discount_percent: 0, discount_amount: 0, total: 0 }
    ])
    
    toast('Ready to create new bill', {
      icon: '📝',
      duration: 2000
    })
  }

  const generateBillNumber = () => {
    const now = new Date()
    const dateStr = format(now, 'yyyyMMdd')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `OP${dateStr}-${random}`
  }

  const handleBillItemChange = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...billItems]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'rate' || field === 'unit') {
      const item = newItems[index]
      const amount = item.unit * item.rate
      const discount = amount * (item.discount_percent / 100)
      newItems[index].amount = amount
      newItems[index].discount_amount = discount
      newItems[index].total = amount - discount
    }
    
    if (field === 'discount_percent') {
      const item = newItems[index]
      const discount = item.amount * (item.discount_percent / 100)
      newItems[index].discount_amount = discount
      newItems[index].total = item.amount - discount
    }
    
    setBillItems(newItems)
  }

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      { particular: '', doctor: '', department: '', unit: 1, rate: 0, amount: 0, discount_percent: 0, discount_amount: 0, total: 0 }
    ])
  }

  const removeBillItem = (index: number) => {
    if (billItems.length > 1) {
      const newItems = billItems.filter((_, i) => i !== index)
      setBillItems(newItems)
    }
  }

  const calculateTotals = () => {
    const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0)
    const totalDiscount = billItems.reduce((sum, item) => sum + item.discount_amount, 0)
    const netAmount = totalAmount - totalDiscount
    
    return { totalAmount, totalDiscount, netAmount }
  }

  const handleSaveBill = async () => {
    // If selected patient exists, update it, otherwise create new
    if (!selectedPatient && (!patientFormData.name || !patientFormData.age || !patientFormData.gender || 
        !patientFormData.complaint || !patientFormData.phone || !patientFormData.doctor_id)) {
      toast.error('Please fill all required patient details')
      return
    }

    // Validate Bill
    const { netAmount } = calculateTotals()
    if (netAmount <= 0) {
      toast.error('Total amount must be greater than 0')
      return
    }

    setIsLoading(true)
    
    try {
      let patientId = selectedPatient?.id
      let patientNumber = selectedPatient?.patient_number
      
      // If no selected patient, create new
      if (!selectedPatient) {
        const patientData = {
          ...patientFormData,
          patient_number: `OP-${format(new Date(), 'yyyyMM')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          registration_date: format(new Date(), 'yyyy-MM-dd'),
          registration_time: format(currentTime, 'HH:mm:ss'),
          is_ip: false
        }

        const patientResponse = await axios.post('/patients', patientData)
        patientId = patientResponse.data.id
        patientNumber = patientResponse.data.patient_number
      }

      // Create Bill
      const billData = {
        patient_id: patientId,
        patient_number: patientNumber,
        bill_number: generateBillNumber(),
        bill_type: billFormData.bill_type,
        category: billFormData.category,
        payment_mode: billFormData.payment_mode,
        doctor_id: patientFormData.doctor_id,
        items: billItems.map(item => ({
          particular: item.particular,
          doctor: item.doctor,
          department: item.department,
          unit: item.unit,
          rate: item.rate,
          discount_percent: item.discount_percent
        }))
      }

      await axios.post('/bills/op', billData)
      
      toast.success(`OP Bill created successfully! 
        Patient: ${patientNumber}
        Bill: ${billData.bill_number}
        Amount: ₹${netAmount.toFixed(2)}`)

      handleResetForms()
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save bill')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetForms = () => {
    setSelectedPatient(null)
    setPreviousBills([])
    setCurrentBillIndex(-1)
    setShowPreviousBills(false)
    
    setPatientFormData({
      name: '',
      age: '',
      gender: 'Male',
      complaint: '',
      house: '',
      street: '',
      place: '',
      phone: '',
      email: '',
      doctor_id: doctors[0]?.id || 0,
      referred_by: ''
    })
    
    setBillFormData({
      bill_type: 'Cash',
      category: 'General',
      payment_mode: 'Cash'
    })
    
    setBillItems([
      { particular: 'Consultation', doctor: '', department: 'OPD', unit: 1, rate: 0, amount: 0, discount_percent: 0, discount_amount: 0, total: 0 }
    ])
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const { totalAmount, totalDiscount, netAmount } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building size={24} />
            <div>
              <h1 className="text-xl font-bold">Outpatient Bill Entry</h1>
              <div className="text-sm text-blue-100 opacity-90">
                Bill #: {generateBillNumber()} | Date: {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Search Patient Section */}
        {!selectedPatient && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Search className="mr-2" size={18} />
                  Search OP Patient
                </h2>
                <button
                  onClick={() => setShowSearchResults(!showSearchResults)}
                  className="text-sm text-blue-600 flex items-center"
                >
                  {showSearchResults ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Search by name, phone, address, complaint, referred by..."
                    />
                  </div>
                </div>
                <button
                  onClick={searchPatients}
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {showSearchResults && patients.length > 0 && (
                <div className="mt-3 border border-gray-200 rounded max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">OP No.</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Phone</th>
                        <th className="px-3 py-2 text-left">Complaint</th>
                        <th className="px-3 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(patient => (
                        <tr key={patient.id} className="border-t hover:bg-blue-50">
                          <td className="px-3 py-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {patient.patient_number}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-gray-500">{patient.age} • {patient.gender}</div>
                          </td>
                          <td className="px-3 py-2">{patient.phone}</td>
                          <td className="px-3 py-2">
                            <div className="text-xs truncate max-w-xs">{patient.complaint}</div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => handleSelectPatient(patient)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showSearchResults && patients.length === 0 && !isSearching && (
                <div className="mt-3 text-center py-4 text-gray-500">
                  <Users className="mx-auto mb-2" size={24} />
                  <p>No OP patients found. Try a different search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Patient Info */}
        {selectedPatient && (
          <div className="bg-white rounded-lg shadow border border-green-200">
            <div className="p-3 border-b border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="mr-2 text-green-600" size={18} />
                  <h2 className="font-semibold text-gray-900">Selected Patient</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {selectedPatient.patient_number}
                  </span>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Change Patient
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age/Gender:</span>
                  <span className="ml-2 font-medium">{selectedPatient.age} • {selectedPatient.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{selectedPatient.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Doctor:</span>
                  <span className="ml-2 font-medium">{selectedPatient.doctor_name}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 font-medium">
                    {[selectedPatient.house, selectedPatient.street, selectedPatient.place].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Complaint:</span>
                  <span className="ml-2 font-medium">{selectedPatient.complaint}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Bills Navigation - Only show if patient has previous bills */}
        {selectedPatient && previousBills.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-blue-200">
            <div className="p-3 border-b border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarClock className="mr-2 text-blue-600" size={18} />
                  <h2 className="font-semibold text-gray-900">
                    Previous Bills ({previousBills.length})
                  </h2>
                  {isLoadingBills && (
                    <Loader2 className="ml-2 animate-spin" size={16} />
                  )}
                </div>
                <button
                  onClick={() => setShowPreviousBills(!showPreviousBills)}
                  className="text-sm text-blue-600 flex items-center"
                >
                  {showPreviousBills ? 'Hide' : 'Show'}
                  {showPreviousBills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
            
            {showPreviousBills && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    {currentBillIndex === -1 ? (
                      <span className="text-green-600 font-medium">
                        Creating new bill
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium">
                        Viewing: {previousBills[currentBillIndex].bill_number}
                        {isLoadingBillDetails && (
                          <Loader2 className="ml-2 inline animate-spin" size={14} />
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevBill}
                      disabled={currentBillIndex <= 0 || isLoadingBillDetails}
                      className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <div className="text-sm">
                      {currentBillIndex === -1 ? 'New' : `${currentBillIndex + 1} of ${previousBills.length}`}
                    </div>
                    
                    <button
                      onClick={handleNextBill}
                      disabled={currentBillIndex >= previousBills.length - 1 || isLoadingBillDetails}
                      className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                    
                    {currentBillIndex !== -1 && (
                      <button
                        onClick={handleClearCurrentBill}
                        disabled={isLoadingBillDetails}
                        className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        New Bill
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Previous Bills List */}
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Bill No.</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-left">Amount</th>
                        <th className="px-3 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousBills.map((bill, index) => (
                        <tr 
                          key={bill.id} 
                          className={`border-t hover:bg-blue-50 ${
                            currentBillIndex === index ? 'bg-blue-100' : ''
                          }`}
                        >
                          <td className="px-3 py-2">
                            <span className={`font-medium ${
                              currentBillIndex === index ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                              {bill.bill_number}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {format(new Date(bill.bill_date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              {bill.category}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-bold">
                            ₹{bill.net_amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => handleLoadPreviousBill(index)}
                              disabled={isLoadingBillDetails}
                              className={`px-3 py-1 text-xs rounded disabled:opacity-50 ${
                                currentBillIndex === index
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {currentBillIndex === index ? 'Viewing' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patient Details Section (Only for new patients) */}
        {!selectedPatient && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-3 border-b border-gray-200 bg-blue-50">
              <h2 className="font-semibold text-gray-900">New Patient Details</h2>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-4 gap-3">
                {/* Row 1 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={patientFormData.name}
                    onChange={(e) => setPatientFormData({...patientFormData, name: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Age *</label>
                  <input
                    type="text"
                    value={patientFormData.age}
                    onChange={(e) => setPatientFormData({...patientFormData, age: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Years"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Gender *</label>
                  <select
                    value={patientFormData.gender}
                    onChange={(e) => setPatientFormData({...patientFormData, gender: e.target.value as any})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={patientFormData.phone}
                    onChange={(e) => setPatientFormData({...patientFormData, phone: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Mobile"
                  />
                </div>

                {/* Row 2 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">House No.</label>
                  <input
                    type="text"
                    value={patientFormData.house}
                    onChange={(e) => setPatientFormData({...patientFormData, house: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="House"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Street</label>
                  <input
                    type="text"
                    value={patientFormData.street}
                    onChange={(e) => setPatientFormData({...patientFormData, street: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Street"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Place *</label>
                  <input
                    type="text"
                    value={patientFormData.place}
                    onChange={(e) => setPatientFormData({...patientFormData, place: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={patientFormData.email}
                    onChange={(e) => setPatientFormData({...patientFormData, email: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Email"
                  />
                </div>

                {/* Row 3 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Doctor *</label>
                  <select
                    value={patientFormData.doctor_id}
                    onChange={(e) => setPatientFormData({...patientFormData, doctor_id: parseInt(e.target.value)})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                  >
                    <option value="">Select</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>Dr. {doctor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Referred By</label>
                  <input
                    type="text"
                    value={patientFormData.referred_by}
                    onChange={(e) => setPatientFormData({...patientFormData, referred_by: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Referred by"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Complaint *</label>
                  <input
                    type="text"
                    value={patientFormData.complaint}
                    onChange={(e) => setPatientFormData({...patientFormData, complaint: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="Patient complaint"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill Entry Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Bill Entry</h2>
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  <label className="text-gray-600 mr-2">Bill Type:</label>
                  <select
                    value={billFormData.bill_type}
                    onChange={(e) => setBillFormData({...billFormData, bill_type: e.target.value})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                </div>
                
                <div className="text-sm">
                  <label className="text-gray-600 mr-2">Category:</label>
                  <select
                    value={billFormData.category}
                    onChange={(e) => setBillFormData({...billFormData, category: e.target.value})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="General">General</option>
                    <option value="ICU">ICU</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                
                <div className="text-sm">
                  <label className="text-gray-600 mr-2">Payment:</label>
                  <select
                    value={billFormData.payment_mode}
                    onChange={(e) => setBillFormData({...billFormData, payment_mode: e.target.value})}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            {/* Bill Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 border text-center">#</th>
                    <th className="px-2 py-2 border text-left">Particular</th>
                    <th className="px-2 py-2 border text-left">Doctor</th>
                    <th className="px-2 py-2 border text-left">Department</th>
                    <th className="px-2 py-2 border text-center">Unit</th>
                    <th className="px-2 py-2 border text-center">Rate</th>
                    <th className="px-2 py-2 border text-center">Amount</th>
                    <th className="px-2 py-2 border text-center">Dis%</th>
                    <th className="px-2 py-2 border text-center">Disc Amt</th>
                    <th className="px-2 py-2 border text-center">Total</th>
                    <th className="px-2 py-2 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5 border text-center">{index + 1}</td>
                      <td className="px-2 py-1.5 border">
                        <input
                          type="text"
                          value={item.particular}
                          onChange={(e) => handleBillItemChange(index, 'particular', e.target.value)}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                          placeholder="Particular"
                        />
                      </td>
                      <td className="px-2 py-1.5 border">
                        <input
                          type="text"
                          value={item.doctor}
                          onChange={(e) => handleBillItemChange(index, 'doctor', e.target.value)}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                          placeholder="Doctor"
                        />
                      </td>
                      <td className="px-2 py-1.5 border">
                        <input
                          type="text"
                          value={item.department}
                          onChange={(e) => handleBillItemChange(index, 'department', e.target.value)}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                          placeholder="Department"
                        />
                      </td>
                      <td className="px-2 py-1.5 border">
                        <input
                          type="number"
                          value={item.unit}
                          onChange={(e) => handleBillItemChange(index, 'unit', parseInt(e.target.value) || 0)}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                          min="1"
                        />
                      </td>
                      <td className="px-2 py-1.5 border">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleBillItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="px-2 py-1.5 border text-center font-medium">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 border">
                        <input
                          type="number"
                          value={item.discount_percent}
                          onChange={(e) => handleBillItemChange(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                          className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                          max="100"
                        />
                      </td>
                      <td className="px-2 py-1.5 border text-center text-red-600 font-medium">
                        ₹{item.discount_amount.toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 border text-center text-green-700 font-bold">
                        ₹{item.total.toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 border text-center">
                        {billItems.length > 1 && (
                          <button
                            onClick={() => removeBillItem(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={addBillItem}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
              >
                + Add Item
              </button>
              
              <div className="text-right">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-gray-600">
                    Total: <span className="font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-gray-600">
                    Discount: <span className="font-bold text-red-600">-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="text-lg font-bold text-green-700">
                    Net: ₹{netAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedPatient ? (
                <span className="text-green-600 font-medium">
                  Patient: {selectedPatient.name} ({selectedPatient.patient_number})
                </span>
              ) : patientFormData.name ? (
                <span className="text-blue-600 font-medium">
                  New Patient: {patientFormData.name}
                </span>
              ) : (
                'Enter patient details or search existing patient'
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleResetForms}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
              >
                Clear All
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-blue-300 text-blue-700 text-sm rounded hover:bg-blue-50"
              >
                Print
              </button>
              
              <button
                onClick={handleSaveBill}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm rounded hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Bill'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OPBillEntry