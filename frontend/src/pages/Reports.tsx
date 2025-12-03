import { useState, useEffect } from 'react'
import axios from 'axios'
import { Download, Filter, Calendar, Printer, FileText, BarChart3, PieChart, Users, CreditCard, TrendingUp, Building, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Reports = () => {
  const [activeReport, setActiveReport] = useState('daily-op')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  
  // Filters
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [doctorId, setDoctorId] = useState('')

  const reportTypes = [
    { 
      id: 'daily-op', 
      label: 'Daily OP Report', 
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      description: 'Daily outpatient billing summary'
    },
    { 
      id: 'bill-summary', 
      label: 'Revenue Report', 
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      description: 'Complete billing revenue overview'
    },
    { 
      id: 'patient-list', 
      label: 'Patient List', 
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
      description: 'Registered patient records'
    },
    { 
      id: 'appointment-list', 
      label: 'Appointments', 
      icon: Calendar,
      color: 'from-orange-500 to-red-500',
      description: 'Doctor appointment schedule'
    }
  ]

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      let response
      
      switch (activeReport) {
        case 'daily-op':
          response = await axios.get('/reports/daily-op', {
            params: { report_date: startDate }
          })
          break
        
        case 'bill-summary':
          response = await axios.get('/reports/bill-summary', {
            params: { start_date: startDate, end_date: endDate }
          })
          break
        
        case 'patient-list':
          response = await axios.get('/reports/patient-list', {
            params: { start_date: startDate, end_date: endDate }
          })
          break
        
        case 'appointment-list':
          response = await axios.get('/reports/appointment-list', {
            params: { appointment_date: startDate, doctor_id: doctorId || undefined }
          })
          break
        
        default:
          response = await axios.get('/reports/daily-op')
      }
      
      setReportData(response.data)
    } catch (error) {
      toast.error('Failed to fetch report')
      setReportData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [activeReport, startDate, endDate, doctorId])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!reportData) return
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeReport}-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  const getTotalRevenue = () => {
    if (!reportData) return 0
    
    if (activeReport === 'daily-op') {
      return Array.isArray(reportData) 
        ? reportData.reduce((sum: number, bill: any) => sum + (bill.net_amount || 0), 0)
        : 0
    } else if (activeReport === 'bill-summary') {
      return reportData.total_amount || 0
    }
    return 0
  }

  const getRecordCount = () => {
    if (!reportData) return 0
    
    if (Array.isArray(reportData)) {
      return reportData.length
    } else if (reportData.op_bills || reportData.ip_bills) {
      return (reportData.op_bills?.length || 0) + (reportData.ip_bills?.length || 0)
    }
    return 0
  }

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      )
    }

    if (!reportData) {
      return (
        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl">
          <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {getRecordCount() === 0 ? 
              'No records found for the selected filters. Try adjusting your date range or criteria.' :
              'Select a report type and apply filters to view data.'
            }
          </p>
        </div>
      )
    }

    switch (activeReport) {
      case 'daily-op':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bills</p>
                    <p className="text-2xl font-bold text-gray-900">{getRecordCount()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="text-green-500 mr-1" size={16} />
                  <span className="text-green-600">Daily report</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{getTotalRevenue().toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CreditCard className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="text-green-500 mr-1" size={16} />
                  <span className="text-green-600">Today's collection</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cash Bills</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.filter((b: any) => b.bill_type === 'Cash').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <CreditCard className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Insurance Bills</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.filter((b: any) => b.bill_type === 'Insurance').length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Building className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Bill No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Bill Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Net Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(reportData) && reportData.map((bill: any, index: number) => (
                    <tr key={bill.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{bill.bill_number}</div>
                        <div className="text-sm text-gray-600">{format(new Date(bill.bill_date), 'HH:mm')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{bill.patient?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{bill.patient?.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{bill.doctor?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{bill.doctor?.specialty || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          bill.bill_type === 'Cash' ? 'bg-green-100 text-green-800' :
                          bill.bill_type === 'Insurance' ? 'bg-blue-100 text-blue-800' :
                          bill.bill_type === 'Card' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bill.bill_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">₹{bill.total_amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">
                        ₹{bill.discount_amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-green-700">₹{bill.net_amount?.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'bill-summary':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">OP Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{reportData?.total_op_amount?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600 mt-1">{reportData?.op_bills?.length || 0} bills</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">IP Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{reportData?.total_ip_amount?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600 mt-1">{reportData?.ip_bills?.length || 0} bills</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Building className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-700">₹{reportData?.total_amount?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-green-600 mt-1">Combined total</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Bill No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Net Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    ...(reportData?.op_bills || []),
                    ...(reportData?.ip_bills || [])
                  ].map((bill: any, index: number) => (
                    <tr key={bill.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{bill.bill_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center w-16 justify-center ${
                          bill.bill_number?.startsWith('OP') 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {bill.bill_number?.startsWith('OP') ? 'OP' : 'IP'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{bill.patient?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{bill.patient?.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{format(new Date(bill.bill_date), 'dd/MM/yyyy')}</div>
                        <div className="text-sm text-gray-600">{format(new Date(bill.bill_date), 'HH:mm')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-green-700">₹{bill.net_amount?.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'patient-list':
        return (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{getRecordCount()}</p>
                  <div className="flex space-x-4 mt-2">
                    <div>
                      <span className="text-sm text-gray-600">OP Patients:</span>
                      <span className="ml-2 font-semibold text-blue-700">
                        {Array.isArray(reportData) ? reportData.filter((p: any) => !p.is_ip).length : 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">IP Patients:</span>
                      <span className="ml-2 font-semibold text-purple-700">
                        {Array.isArray(reportData) ? reportData.filter((p: any) => p.is_ip).length : 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-100 rounded-xl">
                  <Users className="text-purple-600" size={32} />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Registered On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(reportData) && reportData.map((patient: any, index: number) => (
                    <tr key={patient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {patient.is_ip ? patient.ip_number : patient.op_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{patient.age}</div>
                        <div className="text-sm text-gray-600">{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{patient.phone}</div>
                        {patient.email && (
                          <div className="text-sm text-gray-600">{patient.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 max-w-xs truncate">
                          {[patient.house, patient.street, patient.place].filter(Boolean).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{format(new Date(patient.registration_date), 'dd/MM/yyyy')}</div>
                        <div className="text-sm text-gray-600">{format(new Date(patient.registration_date), 'HH:mm')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          patient.is_ip 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {patient.is_ip ? 'INPATIENT' : 'OUTPATIENT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'appointment-list':
        return (
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['Scheduled', 'Completed', 'Cancelled', 'No Show'].map((status) => {
                const count = Array.isArray(reportData) 
                  ? reportData.filter((a: any) => a.status === status).length 
                  : 0
                
                const getStatusColor = (s: string) => {
                  switch (s) {
                    case 'Scheduled': return 'from-blue-50 to-cyan-50 border-blue-200 text-blue-600'
                    case 'Completed': return 'from-green-50 to-emerald-50 border-green-200 text-green-600'
                    case 'Cancelled': return 'from-red-50 to-orange-50 border-red-200 text-red-600'
                    default: return 'from-gray-50 to-gray-100 border-gray-200 text-gray-600'
                  }
                }
                
                return (
                  <div key={status} className={`bg-gradient-to-r rounded-xl p-6 border ${getStatusColor(status)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{status}</p>
                        <p className="text-2xl font-bold mt-1">{count}</p>
                      </div>
                      <Calendar className="opacity-70" size={24} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Token No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Patient Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Doctor Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Time Slot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(reportData) && reportData.map((appointment: any, index: number) => (
                    <tr key={appointment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-lg text-gray-900">{appointment.token_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                        <div className="text-sm text-gray-600">{appointment.patient_phone}</div>
                        <div className="text-xs text-gray-500">{appointment.patient_age || ''} {appointment.patient_gender ? `• ${appointment.patient_gender}` : ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{appointment.doctor_name}</div>
                        <div className="text-sm text-gray-600">{appointment.doctor_specialty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">
                          {format(new Date(appointment.appointment_date), 'hh:mm a')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                          appointment.status === 'Scheduled' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 max-w-xs">{appointment.notes || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="mr-3" size={32} />
              Analytics & Reports
            </h1>
            <p className="text-blue-100 mt-2 text-lg">Comprehensive hospital analytics and reporting</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-blue-100 text-sm">Last Updated</p>
              <p className="text-white font-medium">{format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
            </div>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon
            const isActive = activeReport === report.id
            
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`rounded-2xl p-5 text-left transition-all transform hover:-translate-y-1 ${
                  isActive 
                    ? `${report.color} text-white shadow-xl` 
                    : 'bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                    <Icon size={24} />
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">{report.label}</h3>
                <p className="text-sm opacity-90">{report.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Filter className="mr-3 text-blue-600" size={24} />
            Report Filters & Controls
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Filters Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Filter className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Filter Report Data</h3>
                <p className="text-gray-600">Customize date range and parameters</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {activeReport === 'appointment-list' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Doctor (Optional)
                  </label>
                  <input
                    type="text"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    placeholder="Enter doctor ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={fetchReport}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Filter size={20} className="mr-2" />
                    Apply Filters
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {reportTypes.find(r => r.id === activeReport)?.label}
              </h3>
              <p className="text-gray-600">
                Generated for period: {format(new Date(startDate), 'dd MMM yyyy')} - {format(new Date(endDate), 'dd MMM yyyy')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                disabled={!reportData || isLoading}
                className="px-5 py-2.5 border border-green-300 text-green-700 font-medium rounded-xl hover:bg-green-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} className="mr-2" />
                Export Report
              </button>
              
              <button
                onClick={handlePrint}
                disabled={!reportData || isLoading}
                className="px-5 py-2.5 border border-blue-300 text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer size={18} className="mr-2" />
                Print Report
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {renderReportContent()}
          </div>

          {/* Report Summary */}
          {reportData && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Report Type</p>
                  <p className="text-lg font-bold text-gray-900">
                    {reportTypes.find(r => r.id === activeReport)?.label}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{getRecordCount()}</p>
                </div>
                
                {(activeReport === 'daily-op' || activeReport === 'bill-summary') && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-700">₹{getTotalRevenue().toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  Report generated on {format(new Date(), 'dd MMMM yyyy')} at {format(new Date(), 'hh:mm a')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports