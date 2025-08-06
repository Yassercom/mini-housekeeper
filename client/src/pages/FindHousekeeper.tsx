import { useState, useEffect } from 'react'
import { housekeepersAPI } from '../services/api'

interface Housekeeper {
  id: number;
  name: string;
  location: string;
  rating?: number;
  reviews?: number;
  services: string[];
  experience: string;
  hourly_rate: number;
  photo_url?: string;
  bio?: string;
  approved_at: string;
  created_at: string;
  email: string;
  phone: string;
}

const FindHousekeeper = () => {
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHousekeepers = async () => {
      try {
        setIsLoading(true);
        const response = await housekeepersAPI.getAll();
        setHousekeepers(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load housekeepers. Please try again.');
        console.error('Error fetching housekeepers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHousekeepers();
  }, []);

  // Filter housekeepers based on search term
  const filteredHousekeepers = housekeepers.filter(housekeeper => 
    housekeeper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    housekeeper.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    housekeeper.services.some(service => 
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderStars = (rating: number = 4.5) => {
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

  const getDefaultAvatar = (name: string) => {
    // Generate a random but consistent color based on name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsl(${hue}, 70%, 80%)`;
    
    // Get initials
    const initials = name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
      
    return (
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" 
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  };

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
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search by name, location or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All locations</option>
                  <option value="downtown">Downtown</option>
                  <option value="uptown">Uptown</option>
                  <option value="suburban">Suburban</option>
                </select>
              </div>
              <div>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All services</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="cooking">Cooking</option>
                  <option value="childcare">Childcare</option>
                  <option value="eldercare">Elderly Care</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredHousekeepers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M12 17h.01M12 7a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No housekeepers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term or filter.' : 'There are no approved housekeepers at the moment.'}
            </p>
          </div>
        )}

        {/* Housekeepers Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {!isLoading && filteredHousekeepers.map((housekeeper) => (
            <div key={housekeeper.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="relative">
                      {housekeeper.photo_url ? (
                        <img
                          src={housekeeper.photo_url}
                          alt={housekeeper.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = getDefaultAvatar(housekeeper.name).props.outerHTML;
                          }}
                        />
                      ) : (
                        getDefaultAvatar(housekeeper.name)
                      )}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
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
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {renderStars(housekeeper.rating || 4.5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {housekeeper.rating || 4.5} ({housekeeper.reviews || 'New'})
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
                    <p className="font-semibold text-blue-600">${housekeeper.hourly_rate}/hr</p>
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
        {!isLoading && filteredHousekeepers.length > 6 && (
          <div className="text-center mt-12">
            <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Load More Housekeepers
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FindHousekeeper
