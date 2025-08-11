import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { housekeepersAPI } from '../services/api'
import HousekeeperTable from '../components/admin/HousekeeperTable'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Types
interface Housekeeper {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  services: string[];
  experience: string;
  hourly_rate: number;
  created_at: string;
  status: string;
}

// Modal types
type ModalType = 'approve' | 'reject' | 'delete' | null;

// Stats interface
interface Stats {
  totalHousekeepers: number;
  activeBookings: number;
  pendingRegistrations: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('registrations')
  
  // State for housekeepers
  const [pendingHousekeepers, setPendingHousekeepers] = useState<Housekeeper[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedHousekeeper, setSelectedHousekeeper] = useState<Housekeeper | null>(null)
  
  // Notification avec react-toastify (plus besoin d'état local)

  // Stats state - we'll fetch this from API in a real implementation
  const [stats, setStats] = useState<Stats>({
    totalHousekeepers: 0,
    activeBookings: 0,
    pendingRegistrations: 0,
    totalRevenue: 0
  })
  
  // Check authentication and fetch data on component mount
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin/login')
      return
    }
    
    fetchPendingHousekeepers()
  }, [navigate])
  
  // Fetch pending housekeepers
  const fetchPendingHousekeepers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await housekeepersAPI.getPending()
      // Maintenant response.data contient le tableau des housekeepers
      setPendingHousekeepers(response.data as Housekeeper[])
      
      // Update stats avec le count ou total de la réponse API
      setStats(prev => ({
        ...prev,
        pendingRegistrations: response.total || response.count || 0
      }))
    } catch (err) {
      console.error('Error fetching pending housekeepers:', err)
      setError('Failed to load pending registrations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    // Utiliser react-toastify au lieu de notre système personnalisé
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }
  
  const openModal = (type: ModalType, housekeeper: Housekeeper) => {
    setModalType(type)
    setSelectedHousekeeper(housekeeper)
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setSelectedHousekeeper(null)
  }
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
    showNotification('Logged out successfully!', 'success')
  }

  const handleApproveRegistration = async () => {
    if (!selectedHousekeeper) return
    
    setIsLoading(true)
    try {
      await housekeepersAPI.approve(selectedHousekeeper.id)
      
      // Remove from list and update UI
      setPendingHousekeepers(prev => 
        prev.filter(h => h.id !== selectedHousekeeper.id)
      )
      
      showNotification(`${selectedHousekeeper.name} has been approved successfully.`, 'success')
    } catch (err) {
      console.error('Error approving housekeeper:', err)
      showNotification('Failed to approve. Please try again.', 'error')
    } finally {
      setIsLoading(false)
      closeModal()
    }
  }

  const handleRejectRegistration = async () => {
    if (!selectedHousekeeper) return
    
    setIsLoading(true)
    try {
      await housekeepersAPI.reject(selectedHousekeeper.id)
      
      // Remove from list and update UI
      setPendingHousekeepers(prev => 
        prev.filter(h => h.id !== selectedHousekeeper.id)
      )
      
      showNotification(`${selectedHousekeeper.name} has been rejected.`, 'success')
    } catch (err) {
      console.error('Error rejecting housekeeper:', err)
      showNotification('Failed to reject. Please try again.', 'error')
    } finally {
      setIsLoading(false)
      closeModal()
    }
  }
  
  const handleDeleteRegistration = async () => {
    if (!selectedHousekeeper) return
    
    setIsLoading(true)
    try {
      await housekeepersAPI.delete(selectedHousekeeper.id)
      
      // Remove from list and update UI
      setPendingHousekeepers(prev => 
        prev.filter(h => h.id !== selectedHousekeeper.id)
      )
      
      showNotification(`${selectedHousekeeper.name} has been deleted.`, 'success')
    } catch (err) {
      console.error('Error deleting housekeeper:', err)
      showNotification('Failed to delete. Please try again.', 'error')
    } finally {
      setIsLoading(false)
      closeModal()
    }
  }
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Filter housekeepers based on search term
  const filteredHousekeepers = pendingHousekeepers.filter(housekeeper => 
    housekeeper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    housekeeper.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    housekeeper.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Render confirmation modal
  const renderModal = () => {
    if (!showModal || !selectedHousekeeper) return null
    
    let title = ''
    let message = ''
    let action = () => {}
    let actionButtonText = ''
    let actionButtonColor = ''
    
    switch (modalType) {
      case 'approve':
        title = 'Approve Registration'
        message = `Are you sure you want to approve ${selectedHousekeeper.name}?`
        action = handleApproveRegistration
        actionButtonText = 'Approve'
        actionButtonColor = 'bg-green-600 hover:bg-green-700'
        break
      case 'reject':
        title = 'Reject Registration'
        message = `Are you sure you want to reject ${selectedHousekeeper.name}?`
        action = handleRejectRegistration
        actionButtonText = 'Reject'
        actionButtonColor = 'bg-red-600 hover:bg-red-700'
        break
      case 'delete':
        title = 'Delete Registration'
        message = `Are you sure you want to delete ${selectedHousekeeper.name}? This action cannot be undone.`
        action = handleDeleteRegistration
        actionButtonText = 'Delete'
        actionButtonColor = 'bg-red-600 hover:bg-red-700'
        break
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={action}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${actionButtonColor}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : actionButtonText}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {renderModal()}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Mini Housekeeper Management Portal</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Housekeepers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHousekeepers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`py-4 px-6 font-medium text-sm ${activeTab === 'registrations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Registrations
            </button>
            <button
              onClick={() => setActiveTab('housekeepers')}
              className={`py-4 px-6 font-medium text-sm ${activeTab === 'housekeepers'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Housekeepers
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-6 font-medium text-sm ${activeTab === 'bookings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bookings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'registrations' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Registrations</h2>
              
              {/* Modern Search Bar */}
              <div className="relative mb-8 w-full">
                <div className={`flex items-center w-full bg-white rounded-lg border overflow-hidden transition-all duration-200 ${
                  searchFocused ? 'ring-2 ring-blue-500 border-transparent shadow-lg' : 'border-gray-300'
                }`}>
                  <div className="pl-4 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="flex-1 py-3 px-4 outline-none text-gray-700 placeholder-gray-500"
                  />
                  {searchTerm && (
                    <button 
                      className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
                      onClick={() => setSearchTerm('')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Loading state */}
              {isLoading && !error && pendingHousekeepers.length === 0 && (
                <div className="bg-white p-12 rounded-lg shadow flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3">Loading registrations...</span>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="ml-3 font-medium text-red-800">{error}</span>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={fetchPendingHousekeepers}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {/* Empty state */}
              {!isLoading && !error && pendingHousekeepers.length === 0 && (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending registrations</h3>
                  <p className="mt-1 text-gray-500">There are no new housekeeper registrations waiting for approval.</p>
                </div>
              )}
              
              {/* List of registrations */}
              {!isLoading && !error && pendingHousekeepers.length > 0 && (
                <div className="space-y-6">
                  {filteredHousekeepers.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
                      <p className="mt-1 text-gray-500">Try adjusting your search criteria</p>
                      <button 
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    filteredHousekeepers.map(registration => (
                      <div key={registration.id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{registration.name}</h3>
                            <p className="text-gray-600">{registration.email}</p>
                            <p className="text-gray-600">{registration.phone}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Review
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              Submitted: {formatDate(registration.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Location:</p>
                            <p className="font-medium">{registration.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Experience:</p>
                            <p className="font-medium">{registration.experience}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Hourly Rate:</p>
                            <p className="font-medium">${registration.hourly_rate}/hour</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Services:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {registration.services.map((service, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => openModal('approve', registration)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openModal('reject', registration)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openModal('delete', registration)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'housekeepers' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des Housekeepers</h2>
              <HousekeeperTable />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Management</h2>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <p className="text-gray-600">Booking management interface coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
