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
  const [success, setSuccess] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      // Format data for backend (convert hourly_rate from string to number)
      const submissionData = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        photo_url: formData.photo_url || undefined // Only send if not empty
      }
      
      await housekeepersAPI.register(submissionData)
      setSuccess(true)
      
      // Reset form
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
      
      window.scrollTo(0, 0) // Scroll to top to show success message
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration. Please try again.')
      window.scrollTo(0, 0) // Scroll to top to show error message
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
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1 year">0-1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    id="photo_url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Add a professional photo to help clients recognize you
                  </p>
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
              {formData.services.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  Please select at least one service
                </p>
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
