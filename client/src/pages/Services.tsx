const Services = () => {
  const services = [
    {
      id: 1,
      name: "House Cleaning",
      description: "Professional deep cleaning and regular maintenance for your home",
      icon: "🧹",
      features: ["Deep cleaning", "Regular maintenance", "Eco-friendly products", "Flexible scheduling"],
      price: "Starting from $50/hour"
    },
    {
      id: 2,
      name: "Cooking & Meal Prep",
      description: "Delicious home-cooked meals prepared by experienced chefs",
      icon: "👩‍🍳",
      features: ["Custom meal plans", "Dietary restrictions", "Fresh ingredients", "Weekly prep"],
      price: "Starting from $40/hour"
    },
    {
      id: 3,
      name: "Babysitting",
      description: "Trusted and experienced childcare professionals",
      icon: "👶",
      features: ["Background checked", "CPR certified", "Educational activities", "Flexible hours"],
      price: "Starting from $25/hour"
    },
    {
      id: 4,
      name: "Elderly Care",
      description: "Compassionate care and companionship for seniors",
      icon: "👵",
      features: ["Personal care", "Medication reminders", "Companionship", "Light housekeeping"],
      price: "Starting from $30/hour"
    },
    {
      id: 5,
      name: "Pet Care",
      description: "Loving care for your furry family members",
      icon: "🐕",
      features: ["Dog walking", "Pet sitting", "Feeding", "Playtime"],
      price: "Starting from $20/hour"
    },
    {
      id: 6,
      name: "Garden Maintenance",
      description: "Keep your outdoor spaces beautiful and well-maintained",
      icon: "🌱",
      features: ["Lawn mowing", "Plant care", "Weeding", "Seasonal cleanup"],
      price: "Starting from $35/hour"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional household services tailored to your needs. From cleaning to childcare, 
            we connect you with trusted professionals in your area.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-8">
                {/* Icon */}
                <div className="text-6xl mb-4 text-center">
                  {service.icon}
                </div>
                
                {/* Service Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  {service.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 mb-6 text-center">
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
                
                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">
                    {service.price}
                  </span>
                </div>
                
                {/* CTA Button */}
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-blue-600 text-white rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              Need a Custom Service?
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Don't see what you're looking for? Contact us for personalized household solutions.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services
