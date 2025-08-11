import { useNavigate } from 'react-router-dom'

const Services = () => {
  const navigate = useNavigate()

  const services = [
    {
      id: 1,
      name: "House Cleaning",
      description: "Professional deep cleaning and regular maintenance for your home",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Woman cleaning kitchen counter",
      features: ["Deep cleaning", "Regular maintenance", "Eco-friendly products"],
      price: "50€/heure",
      slug: "house-cleaning"
    },
    {
      id: 2,
      name: "Cooking & Meal Prep",
      description: "Delicious home-cooked meals prepared by experienced chefs",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Chef preparing a meal",
      features: ["Custom meal plans", "Dietary restrictions", "Weekly prep"],
      price: "40€/heure",
      slug: "cooking"
    },
    {
      id: 3,
      name: "Babysitting",
      description: "Trusted and experienced childcare professionals for your peace of mind",
      image: "/images/babysitting.jpg",
      alt: "Babysitter reading to child",
      features: ["Background checked", "CPR certified", "Educational activities"],
      price: "25€/heure",
      slug: "babysitting"
    },
    {
      id: 4,
      name: "Elderly Care",
      description: "Compassionate care and companionship for seniors in the comfort of their home",
      image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Caregiver helping elderly person",
      features: ["Personal care", "Medication reminders", "Light housekeeping"],
      price: "30€/heure",
      slug: "elderly-care"
    },
    {
      id: 5,
      name: "Pet Care",
      description: "Loving care for your furry family members when you can't be there",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Dog walker with dogs",
      features: ["Dog walking", "Pet sitting", "Feeding & playtime"],
      price: "20€/heure",
      slug: "pet-care"
    },
    {
      id: 6,
      name: "Garden Maintenance",
      description: "Keep your outdoor spaces beautiful and well-maintained year-round",
      image: "/images/gardening.jpg",
      alt: "Gardener tending to plants",
      features: ["Lawn mowing", "Plant care", "Seasonal cleanup"],
      price: "35€/heure",
      slug: "gardening"
    }
  ]

  const handleViewHousekeepers = (service: string) => {
    navigate(`/find?service=${encodeURIComponent(service)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nos Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des services ménagers professionnels adaptés à vos besoins. Du nettoyage à la garde d'enfants,
            nous vous connectons avec des professionnels de confiance dans votre région.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.alt} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  loading="lazy"
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.price}
                  </span>
                </div>
                
                {/* Service Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-4 flex-grow">
                  {service.description}
                </p>
                
                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <button 
                  onClick={() => handleViewHousekeepers(service.slug)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <span>Voir les housekeepers</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-4">
              Besoin d'un service personnalisé ?
            </h2>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Vous ne trouvez pas ce que vous cherchez ? Contactez-nous pour des solutions ménagères sur mesure.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md">
              Nous contacter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services
