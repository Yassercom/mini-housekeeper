import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('registrations')

  // Mock data for pending registrations
  const pendingRegistrations = [
    {
      id: 1,
      name: "Emily Watson",
      email: "emily.watson@email.com",
      phone: "(555) 123-4567",
      location: "Brooklyn, NY",
      services: ["House Cleaning", "Organization"],
      experience: "3-5 years",
      hourlyRate: 45,
      submittedAt: "2024-01-15",
      status: "pending"
    },
    {
      id: 2,
      name: "Carlos Martinez",
      email: "carlos.martinez@email.com",
      phone: "(555) 987-6543",
      location: "Queens, NY",
      services: ["Cooking & Meal Prep", "Grocery Shopping"],
      experience: "5+ years",
      hourlyRate: 50,
      submittedAt: "2024-01-14",
      status: "pending"
    },
    {
      id: 3,
      name: "Aisha Johnson",
      email: "aisha.johnson@email.com",
      phone: "(555) 456-7890",
      location: "Manhattan, NY",
      services: ["Babysitting", "Light Cleaning"],
      experience: "1-2 years",
      hourlyRate: 30,
      submittedAt: "2024-01-13",
      status: "pending"
    }
  ]

  // Mock data for system stats
  const stats = {
    totalHousekeepers: 127,
    activeBookings: 45,
    pendingRegistrations: 8,
    totalRevenue: 15420
  }

  const handleLogout = () => {
    // TODO: Implement actual logout
    alert('Logged out successfully!')
    navigate('/admin/login')
  }

  const handleApproveRegistration = (id: number) => {
    // TODO: Implement approval logic
    alert(`Registration ${id} approved!`)
  }

  const handleRejectRegistration = (id: number) => {
    // TODO: Implement rejection logic
    alert(`Registration ${id} rejected!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('registrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'registrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Registrations
              </button>
              <button
                onClick={() => setActiveTab('housekeepers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'housekeepers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Housekeepers
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'registrations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Registrations</h2>
                <div className="space-y-4">
                  {pendingRegistrations.map((registration) => (
                    <div key={registration.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{registration.name}</h3>
                          <p className="text-gray-600">{registration.email}</p>
                          <p className="text-gray-600">{registration.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Review
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {registration.submittedAt}
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
                          <p className="font-medium">${registration.hourlyRate}/hour</p>
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
                          onClick={() => handleApproveRegistration(registration.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(registration.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'housekeepers' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">All Housekeepers</h2>
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <p className="text-gray-600">Housekeeper management interface coming soon...</p>
                </div>
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
    </div>
  )
}

export default AdminDashboard
