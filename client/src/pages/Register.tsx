import { useState } from 'react'
import { housekeepersAPI } from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    photo_url: '',
    services: [] as string[],
    hourly_rate: '',
    bio: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [success, setSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const availableServices = [
    'House Cleaning',
    'Cooking & Meal Prep',
    'Babysitting',
    'Elderly Care',
    'Pet Care',
    'Garden Maintenance',
    'Laundry',
    'Organization'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Veuillez sélectionner une image (JPG, PNG, etc.)')
        return
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 2MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        setFormData(prev => ({
          ...prev,
          photo_url: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    
    try {
      const formatPhoneNumber = (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        
        if (numbers.length === 0) return '';
        
        if (numbers.length <= 2) {
          return numbers;
        } else if (numbers.length <= 4) {
          return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
        } else if (numbers.length <= 6) {
          return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
        } else if (numbers.length <= 8) {
          return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6)}`;
        } else {
          return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
        }
      }

      const validationErrors: Record<string, string[]> = {};
      
      // Validation du nom
      if (!formData.name.trim()) {
        validationErrors.name = ["Le nom est requis"];
      } else if (formData.name.trim().length < 2) {
        validationErrors.name = ["Le nom doit contenir au moins 2 caractères"];
      }
      
      // Validation de l'email
      if (!formData.email.trim()) {
        validationErrors.email = ["L'email est requis"];
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.email = ["Format d'email invalide"];
      }
      
      // Validation du téléphone
      if (!formData.phone.trim()) {
        validationErrors.phone = ["Le numéro de téléphone est requis"];
      } else if (formData.phone.replace(/\D/g, '').length !== 10) {
        validationErrors.phone = ["Le numéro doit comporter 10 chiffres"];
      }
      
      // Validation de la localisation
      if (!formData.location.trim()) {
        validationErrors.location = ["La localisation est requise"];
      }
      
      // Validation de l'expérience
      if (!formData.experience) {
        validationErrors.experience = ["L'expérience est requise"];
      }
      
      // Validation des services
      if (formData.services.length === 0) {
        validationErrors.services = ["Sélectionnez au moins un service"];
      }
      
      // Validation du tarif horaire
      const hourlyRate = parseFloat(formData.hourly_rate);
      if (!formData.hourly_rate.trim()) {
        validationErrors.hourly_rate = ["Le tarif horaire est requis"];
      } else if (isNaN(hourlyRate)) {
        validationErrors.hourly_rate = ["Le tarif doit être un nombre"];
      } else if (hourlyRate < 15 || hourlyRate > 100) {
        validationErrors.hourly_rate = ["Le tarif doit être entre 15 et 100"];
      }
      
      // Si des erreurs sont détectées, ne pas soumettre le formulaire
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setError("Veuillez corriger les erreurs dans le formulaire");
        setIsLoading(false);
        return;
      }

      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formatPhoneNumber(formData.phone),
        location: formData.location,
        experience: formData.experience,
        bio: formData.bio,
        services: formData.services,
        hourlyRate: parseFloat(formData.hourly_rate),
        photoUrl: '' // Add the property with a default value
      }
      
      if (formData.photo_url && formData.photo_url.trim() !== '') {
        submissionData.photoUrl = formData.photo_url;
      }
      
      await housekeepersAPI.register(submissionData)
      setSuccess(true)
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        experience: '',
        photo_url: '',
        services: [],
        hourly_rate: '',
        bio: ''
      })
      
      window.scrollTo(0, 0) 
    } catch (err: any) {
      if (err.response?.data?.errorDetails) {
        setFieldErrors(err.response.data.errorDetails);
        setError(`Veuillez corriger les erreurs dans le formulaire (${err.response.data.errorCount} erreur(s))`);
      } else if (err.response?.data?.errors) {
        setError(`Erreur de validation : ${err.response.data.errors}`);
      } else if (err.response?.data?.message === 'Email already registered') {
        setFieldErrors({ email: ['Cette adresse email est déjà enregistrée'] });
        setError('Cette adresse e-mail est déjà enregistrée. Veuillez utiliser une autre adresse.');
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
      window.scrollTo(0, 0) 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Register as a Housekeeper
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our network of trusted professionals and start earning by helping families in your community.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Registration submitted successfully! We will review your application and get back to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="list-disc list-inside mt-2 ml-6 text-sm">
                {Object.entries(fieldErrors).map(([field, errors]) => (
                  <li key={field} className="mt-1">
                    <span className="font-semibold capitalize">{field.replace('_', ' ')}:</span> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {fieldErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.name[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format requis: 0X XX XX XX XX
                  </p>
                  {fieldErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your zone/neighborhood</option>
                    <option value="downtown">Downtown</option>
                    <option value="uptown">Uptown</option>
                    <option value="midtown">Midtown</option>
                    <option value="westside">West Side</option>
                    <option value="eastside">East Side</option>
                    <option value="suburban">Suburban Area</option>
                  </select>
                  {fieldErrors.location && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.location[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select experience</option>
                    <option value="0-1 year">0-1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                  {fieldErrors.experience && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.experience[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate ($) *
                  </label>
                  <input
                    type="number"
                    id="hourly_rate"
                    name="hourly_rate"
                    required
                    min="10"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.hourly_rate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="25.00"
                  />
                  {fieldErrors.hourly_rate && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.hourly_rate[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-start">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: JPG or PNG, max 2MB
                      </p>
                    </div>
                    {previewImage && (
                      <div className="ml-4 relative">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="h-24 w-24 object-cover rounded-lg border border-gray-300" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null)
                            setFormData(prev => ({ ...prev, photo_url: '' }))
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Services Offered</h2>
              <p className="text-gray-600 mb-4">Select all services you can provide:</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableServices.map((service) => (
                  <label
                    key={service}
                    className={`flex items-center p-4 border ${
                      formData.services.includes(service) 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-gray-300 hover:bg-gray-50'
                    } rounded-lg cursor-pointer transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.services && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.services[0]}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself, your experience, and what makes you a great housekeeper..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional: Help clients get to know you better
              </p>
            </div>

            {/* Terms and Submit */}
            <div className="border-t pt-8">
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
              
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="background"
                  required
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="background" className="ml-3 text-sm text-gray-700">
                  I consent to a background check as part of the verification process
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.services.length === 0}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : 'Submit Registration'}
              </button>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                We'll review your application within 2-3 business days and contact you with next steps.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
