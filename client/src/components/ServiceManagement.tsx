import React, { useState, useEffect } from 'react';
import { servicesAPI, adminAPI } from '../services/api';
import { toast } from 'react-toastify';

interface Service {
  id: number;
  name: string;
  description: string;
  picture: string;
  created_at: string;
  updated_at: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  picture: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    picture: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ServiceFormData>>({});

  const limit = 10;

  // Load services
  const loadServices = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const token = adminAPI.getToken();
      const response = await servicesAPI.getAll({ page, limit, search }, token || undefined);
      
      if (response.success) {
        setServices(response.data as Service[]);
        setTotalPages(response.totalPages);
        setCurrentPage(page);
      } else {
        toast.error('Erreur lors du chargement des services');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadServices();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices(1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadServices(page, searchTerm);
  };

  // Open modal
  const openModal = (type: 'add' | 'edit' | 'delete', service?: Service) => {
    setModalType(type);
    setSelectedService(service || null);
    
    if (type === 'add') {
      setFormData({ name: '', description: '', picture: '' });
    } else if (type === 'edit' && service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        picture: service.picture || ''
      });
    }
    
    setFormErrors({});
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setFormData({ name: '', description: '', picture: '' });
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<ServiceFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom du service est requis';
    } else if (formData.name.trim().length > 255) {
      errors.name = 'Le nom ne peut pas dépasser 255 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const token = adminAPI.getToken();
      
      if (modalType === 'add') {
        const response = await servicesAPI.create(formData, token || undefined);
        if (response.success) {
          toast.success('Service créé avec succès');
          loadServices(currentPage, searchTerm);
          closeModal();
        } else {
          toast.error(response.message || 'Erreur lors de la création du service');
        }
      } else if (modalType === 'edit' && selectedService) {
        const response = await servicesAPI.update(selectedService.id, formData, token || undefined);
        if (response.success) {
          toast.success('Service mis à jour avec succès');
          loadServices(currentPage, searchTerm);
          closeModal();
        } else {
          toast.error(response.message || 'Erreur lors de la mise à jour du service');
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'opération';
      toast.error(message);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      const token = adminAPI.getToken();
      const response = await servicesAPI.delete(selectedService.id, token || undefined);
      
      if (response.success) {
        toast.success('Service supprimé avec succès');
        loadServices(currentPage, searchTerm);
        closeModal();
      } else {
        toast.error(response.message || 'Erreur lors de la suppression du service');
      }
    } catch (error: any) {
      console.error('Error deleting service:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Services</h1>
        <button
          onClick={() => openModal('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Ajouter un Service
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher des services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucun service trouvé
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {service.description || 'Aucune description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {service.picture ? (
                      <img
                        src={service.picture}
                        alt={service.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-service.png';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(service.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('edit', service)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => openModal('delete', service)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'text-white bg-blue-600 border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'add' && 'Ajouter un Service'}
                {modalType === 'edit' && 'Modifier le Service'}
                {modalType === 'delete' && 'Supprimer le Service'}
              </h3>

              {modalType === 'delete' ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Êtes-vous sûr de vouloir supprimer le service "{selectedService?.name}" ?
                    Cette action ne peut pas être annulée.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du service *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Nettoyage de maison"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description du service..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.picture}
                      onChange={(e) => setFormData({ ...formData, picture: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {modalType === 'add' ? 'Créer' : 'Modifier'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
