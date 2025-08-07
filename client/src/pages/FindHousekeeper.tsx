import { useState, useEffect } from 'react'
import { housekeepersAPI } from '../services/api'
import { FaMapMarkerAlt, FaClock, FaChevronDown, FaChevronUp, FaStar, FaMoneyBillWave } from 'react-icons/fa'

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
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [maxRateFilter, setMaxRateFilter] = useState(100);
  const [searchFilter, setSearchFilter] = useState('');

  // Fonction pour récupérer les housekeepers avec filtres
  const fetchHousekeepers = async () => {
    try {
      setIsLoading(true);
      
      // D'abord, vérifier s'il y a des housekeepers approuvés dans la base
      const allHousekeepersData = await housekeepersAPI.getAll({});
      
      // Si la base ne contient aucun housekeeper approuvé
      if (Array.isArray(allHousekeepersData) && allHousekeepersData.length === 0) {
        setHousekeepers([]);
        setError("Il n'existe aucun housekeeper approuvé dans notre base de données.");
        return;
      }

      // Si des housekeepers existent, appliquer les filtres
      const housekeepersData = await housekeepersAPI.getAll({
        region: regionFilter || undefined,
        service: serviceFilter || undefined,
        minRating: minRatingFilter > 0 ? minRatingFilter : undefined,
        maxRate: maxRateFilter < 100 ? maxRateFilter : undefined,
        search: searchFilter || undefined
      });
      
      // Vérifier si nous avons reçu un tableau
      if (Array.isArray(housekeepersData)) {
        setHousekeepers(housekeepersData);
        // Si le tableau est vide avec des filtres appliqués
        if (housekeepersData.length === 0) {
          setError("Aucun housekeeper ne correspond à vos critères de recherche");
        } else {
          setError(null);
        }
      } else {
        console.log('API returned unexpected data type:', housekeepersData);
        setHousekeepers([]);
        setError("Format de données inattendu. Veuillez réessayer.");
      }
      
    } catch (err: any) {
      // En cas d'erreur de connexion ou serveur, masquer les messages techniques
      setHousekeepers([]);
      setError("Impossible de récupérer les housekeepers. Veuillez vérifier votre connexion et réessayer.");
      console.error('Error fetching housekeepers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Appliquer la recherche avancée
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHousekeepers();
  };

  // Recherche initiale au chargement de la page
  useEffect(() => {
    fetchHousekeepers();
  }, []);

  // Le filtrage est maintenant géré côté backend via l'API
  // Pour le filtrage local (searchTerm), nous le conservons uniquement pour la rétro-compatibilité
  const filteredHousekeepers = Array.isArray(housekeepers) 
    ? housekeepers.filter((housekeeper) => {
        return searchTerm
          ? housekeeper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            housekeeper.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (housekeeper.services && housekeeper.services.some(service => 
              service.toLowerCase().includes(searchTerm.toLowerCase())))
          : true;
      })
    : [];

  // Générer un avatar par défaut avec les initiales et une couleur de fond basée sur le nom
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

  // Gestion des erreurs de chargement d'images
  const handleImageError = (id: number) => {
    setFailedImages(prev => ({
      ...prev,
      [id]: true
    }));
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Search Housekeepers</h2>
              <button
                type="button"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showAdvancedSearch ? (
                  <>
                    <span>Simple Search</span>
                    <FaChevronUp className="ml-1" />
                  </>
                ) : (
                  <>
                    <span>Advanced Search</span>
                    <FaChevronDown className="ml-1" />
                  </>
                )}
              </button>
            </div>
            
            <form onSubmit={applyFilters} className="bg-white rounded-lg p-4 shadow-sm">
              {/* Mode de recherche simple */}
              {!showAdvancedSearch ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex">
                      <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      >
                        <option value="">Select a zone/neighborhood</option>
                        <option value="downtown">Downtown</option>
                        <option value="uptown">Uptown</option>
                        <option value="midtown">Midtown</option>
                        <option value="westside">West Side</option>
                        <option value="eastside">East Side</option>
                        <option value="suburban">Suburban Area</option>
                      </select>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 rounded-r-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center"
                      >
                        {isLoading ? (
                          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                        {isLoading ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode de recherche avancée */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Région/Zone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value="">Select a zone/neighborhood</option>
                      <option value="downtown">Downtown</option>
                      <option value="uptown">Uptown</option>
                      <option value="midtown">Midtown</option>
                      <option value="westside">West Side</option>
                      <option value="eastside">East Side</option>
                      <option value="suburban">Suburban Area</option>
                    </select>
                  </div>
                  
                  {/* Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value="">All services</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="cooking">Cooking</option>
                      <option value="childcare">Childcare</option>
                      <option value="eldercare">Elderly Care</option>
                    </select>
                  </div>
                  
                  {/* Rating Minimum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Rating: {minRatingFilter}
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRatingFilter}
                        onChange={(e) => setMinRatingFilter(parseFloat(e.target.value))}
                        className="w-full accent-green-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prix Maximum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Hourly Rate: ${maxRateFilter}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxRateFilter}
                      onChange={(e) => setMaxRateFilter(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    />
                  </div>
                  
                  {/* Recherche par nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    />
                  </div>
                  
                  {/* Bouton d'application des filtres */}
                  <div className="lg:col-span-3 mt-4">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center font-medium shadow-md"
                    >
                      {isLoading ? (
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                      {isLoading ? 'Searching...' : 'Apply Filters'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Messages d'erreur ou de résultat vide */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          {!isLoading && filteredHousekeepers.length === 0 && !error && (
            <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
              <p>No housekeepers found matching your criteria. Please try different filters.</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && filteredHousekeepers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-xl">
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
                      {housekeeper.photo_url && !failedImages[housekeeper.id] ? (
                        <img
                          src={housekeeper.photo_url}
                          alt={`${housekeeper.name}'s profile`}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                          onError={() => handleImageError(housekeeper.id)}
                        />
                      ) : (
                        <div className="mr-4">
                          {getDefaultAvatar(housekeeper.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {housekeeper.name}
                      </h3>
                      <p className="text-gray-600 text-sm flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-gray-500" />
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
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <FaStar 
                          key={index} 
                          className={`w-4 h-4 ${index < Math.floor(housekeeper.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
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
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaClock className="mr-1 text-gray-500" /> Experience
                    </p>
                    <p className="font-semibold">{housekeeper.experience}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center justify-end">
                      <FaMoneyBillWave className="mr-1 text-gray-500" /> Hourly Rate
                    </p>
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
  );
};

export default FindHousekeeper;
