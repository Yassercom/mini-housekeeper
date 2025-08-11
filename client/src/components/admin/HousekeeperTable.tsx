import { useState, useEffect } from 'react';
import { housekeepersAPI } from '../../services/api';
import { FiSearch, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Types
interface Housekeeper {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  region?: string;
  services: string[];
  experience: string;
  hourly_rate: number;
  created_at: string;
  approved_at?: string;
  status: string;
  rating?: number;
  photo_url?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  confirmColor: string;
  isLoading: boolean;
}

// Modal component for confirmations
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText,
  confirmColor,
  isLoading
}: ModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 ${confirmColor} text-white rounded-md flex items-center justify-center min-w-[80px]`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const HousekeeperTable = () => {
  // Table data state
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    region: ''
  });
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: '',
    actionType: '',
    housekeeperId: 0,
    isLoading: false
  });
  
  // Format date to local string
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Load housekeepers with current filters and pagination
  const loadHousekeepers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }
      
      const { page, limit } = pagination;
      const { status, search, region } = filters;
      
      const response = await housekeepersAPI.getAll({ 
        page, 
        limit, 
        status, 
        search: search || undefined,
        region: region || undefined
      }, token);
      
      // Convertir les données en tableau typé Housekeeper[]
      setHousekeepers(response.data as Housekeeper[]);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 1
      });
      
    } catch (err) {
      console.error('Error loading housekeepers:', err);
      setError('Impossible de charger les housekeepers. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadHousekeepers();
  }, [pagination.page, filters.status]);
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1 when applying new filters
    setPagination(prev => ({ ...prev, page: 1 }));
    loadHousekeepers();
  };
  
  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Open modal for approve/reject/delete
  const openModal = (actionType: string, housekeeper: Housekeeper) => {
    let title = '';
    let message = '';
    let confirmText = '';
    let confirmColor = '';
    
    switch (actionType) {
      case 'approve':
        title = 'Approuver l\'inscription';
        message = `Êtes-vous sûr de vouloir approuver l'inscription de ${housekeeper.name} ?`;
        confirmText = 'Approuver';
        confirmColor = 'bg-green-600 hover:bg-green-700';
        break;
      case 'reject':
        title = 'Rejeter l\'inscription';
        message = `Êtes-vous sûr de vouloir rejeter l'inscription de ${housekeeper.name} ?`;
        confirmText = 'Rejeter';
        confirmColor = 'bg-red-600 hover:bg-red-700';
        break;
      case 'delete':
        title = 'Supprimer l\'inscription';
        message = `Êtes-vous sûr de vouloir supprimer définitivement l'inscription de ${housekeeper.name} ? Cette action est irréversible.`;
        confirmText = 'Supprimer';
        confirmColor = 'bg-gray-700 hover:bg-gray-800';
        break;
    }
    
    setModal({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmColor,
      actionType,
      housekeeperId: housekeeper.id,
      isLoading: false
    });
  };
  
  // Close modal
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };
  
  // Handle action confirmation
  const handleConfirmAction = async () => {
    const { actionType, housekeeperId } = modal;
    setModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        closeModal();
        return;
      }
      
      switch (actionType) {
        case 'approve':
          await housekeepersAPI.approve(housekeeperId, token);
          toast.success('Housekeeper approuvé avec succès');
          break;
        case 'reject':
          await housekeepersAPI.reject(housekeeperId, token);
          toast.success('Housekeeper rejeté avec succès');
          break;
        case 'delete':
          await housekeepersAPI.delete(housekeeperId, token);
          toast.success('Housekeeper supprimé avec succès');
          break;
      }
      
      // Remove from list (optimistic update)
      setHousekeepers(prev => prev.filter(h => h.id !== housekeeperId));
      
      // Update total count
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        // Recalculate total pages
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }));
      
      // If we've removed the last item on the current page, go to previous page
      if (housekeepers.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        // Refresh data to ensure consistency
        loadHousekeepers();
      }
      
    } catch (err: any) {
      console.error(`Error on ${actionType}:`, err);
      toast.error(err.response?.data?.message || `Erreur lors de l'action ${actionType}`);
    } finally {
      closeModal();
    }
  };
  
  // Calculate pagination info
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des housekeepers</h2>
      
      {/* Filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Région</label>
            <input
              type="text"
              id="region"
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              placeholder="Filtrer par région..."
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex-grow min-w-[240px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Nom ou email..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white h-[42px] px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recherche...
                </>
              ) : (
                <>
                  <FiSearch />
                  Rechercher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Loading state */}
      {isLoading && housekeepers.length === 0 && !error && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chargement des données...</h3>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2">
                <button
                  onClick={loadHousekeepers}
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && housekeepers.length === 0 && !error && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun résultat</h3>
          <p className="mt-1 text-gray-500">
            {filters.status 
              ? `Aucun housekeeper avec le statut "${filters.status === 'pending' ? 'en attente' : filters.status === 'approved' ? 'approuvé' : 'rejeté'}"`
              : "Aucun housekeeper trouvé"
            }
            {(filters.search || filters.region) && " correspondant aux filtres"}
          </p>
        </div>
      )}
      
      {/* Table */}
      {!isLoading && housekeepers.length > 0 && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarif
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {housekeepers.map((housekeeper) => (
                <tr key={housekeeper.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {housekeeper.photo_url ? (
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img
                            src={housekeeper.photo_url}
                            alt={housekeeper.name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback for broken images
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=HK';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-gray-500 font-medium">
                            {housekeeper.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{housekeeper.name}</div>
                        <div className="text-sm text-gray-500">{housekeeper.region || housekeeper.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{housekeeper.email}</div>
                    <div className="text-sm text-gray-500">{housekeeper.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {housekeeper.services.slice(0, 2).map((service, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          {service}
                        </span>
                      ))}
                      {housekeeper.services.length > 2 && (
                        <span className="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-gray-800">
                          +{housekeeper.services.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{housekeeper.hourly_rate}€/h</div>
                    <div className="text-sm text-gray-500">{housekeeper.experience}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Soumis:</div>
                    <div className="text-sm text-gray-900">{formatDate(housekeeper.created_at)}</div>
                    {housekeeper.approved_at && (
                      <>
                        <div className="text-sm text-gray-500 mt-1">Approuvé:</div>
                        <div className="text-sm text-gray-900">{formatDate(housekeeper.approved_at)}</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {housekeeper.status === 'approved' && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approuvé
                      </span>
                    )}
                    {housekeeper.status === 'pending' && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    )}
                    {housekeeper.status === 'rejected' && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Rejeté
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {housekeeper.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openModal('approve', housekeeper)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Approuver"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('reject', housekeeper)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Rejeter"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openModal('delete', housekeeper)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Supprimer"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {!isLoading && housekeepers.length > 0 && !error && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startItem}</span> à{' '}
                <span className="font-medium">{endItem}</span> sur{' '}
                <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 
                    ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Précédent</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Calculate page number logic for showing pages around current page
                  let pageNum;
                  
                  if (pagination.totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else {
                    // For more pages, show smart range around current page
                    const middleIndex = Math.floor(5 / 2);
                    
                    if (pagination.page <= middleIndex + 1) {
                      // Near start
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - middleIndex) {
                      // Near end
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      // Middle
                      pageNum = pagination.page - middleIndex + i;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
                        ${pagination.page === pageNum
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300
                    ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Suivant</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        confirmColor={modal.confirmColor}
        onConfirm={handleConfirmAction}
        onCancel={closeModal}
        isLoading={modal.isLoading}
      />
    </div>
  );
};

export default HousekeeperTable;
