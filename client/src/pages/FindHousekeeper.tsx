const FindHousekeeper = () => {
  const housekeepers = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Downtown, New York",
      rating: 4.9,
      reviews: 127,
      services: ["Cleaning", "Cooking"],
      experience: "5 years",
      hourlyRate: 45,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      verified: true,
      available: true
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      location: "Brooklyn, New York",
      rating: 4.8,
      reviews: 89,
      services: ["Babysitting", "Light Cleaning"],
      experience: "3 years",
      hourlyRate: 35,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      verified: true,
      available: true
    },
    {
      id: 3,
      name: "Jennifer Chen",
      location: "Queens, New York",
      rating: 5.0,
      reviews: 203,
      services: ["Deep Cleaning", "Organization"],
      experience: "7 years",
      hourlyRate: 55,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      verified: true,
      available: false
    },
    {
      id: 4,
      name: "David Thompson",
      location: "Manhattan, New York",
      rating: 4.7,
      reviews: 156,
      services: ["Cooking", "Meal Prep"],
      experience: "4 years",
      hourlyRate: 50,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      verified: true,
      available: true
    },
    {
      id: 5,
      name: "Lisa Park",
      location: "Bronx, New York",
      rating: 4.9,
      reviews: 94,
      services: ["Elderly Care", "Companionship"],
      experience: "6 years",
      hourlyRate: 40,
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
      verified: true,
      available: true
    },
    {
      id: 6,
      name: "Michael Brown",
      location: "Staten Island, New York",
      rating: 4.6,
      reviews: 72,
      services: ["Pet Care", "Dog Walking"],
      experience: "2 years",
      hourlyRate: 30,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      verified: true,
      available: true
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find a Housekeeper
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Browse our network of trusted, verified housekeepers in your area.
          </p>
          
          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Locations</option>
                  <option>Manhattan</option>
                  <option>Brooklyn</option>
                  <option>Queens</option>
                  <option>Bronx</option>
                  <option>Staten Island</option>
                </select>
              </div>
              <div>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Services</option>
                  <option>Cleaning</option>
                  <option>Cooking</option>
                  <option>Babysitting</option>
                  <option>Elderly Care</option>
                  <option>Pet Care</option>
                </select>
              </div>
              <div>
                <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing {housekeepers.length} housekeepers in your area
          </p>
        </div>

        {/* Housekeepers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {housekeepers.map((housekeeper) => (
            <div
              key={housekeeper.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={housekeeper.avatar}
                        alt={housekeeper.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {housekeeper.verified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {housekeeper.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {housekeeper.location}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    housekeeper.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {housekeeper.available ? 'Available' : 'Busy'}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {renderStars(housekeeper.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {housekeeper.rating} ({housekeeper.reviews} reviews)
                  </span>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {housekeeper.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience and Rate */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold">{housekeeper.experience}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="font-semibold text-blue-600">${housekeeper.hourlyRate}/hr</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Contact
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Load More Housekeepers
          </button>
        </div>
      </div>
    </div>
  )
}

export default FindHousekeeper
