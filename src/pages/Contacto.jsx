import { useState } from 'react'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

function Contacto() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí puedes agregar la lógica para enviar el formulario
    console.log('Formulario enviado:', formData)
    alert('¡Gracias por contactarnos! Te responderemos pronto.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-black mb-4">
            Contáct<span className="text-primary-red">anos</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos
            lo antes posible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Información de contacto */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-black mb-6">
                Información de Contacto
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-red rounded-full p-3 flex-shrink-0">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">
                      Dirección
                    </h3>
                    <p className="text-gray-600">
                      Dirección de la tienda, Ciudad, País
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-yellow rounded-full p-3 flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-primary-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">
                      Teléfono
                    </h3>
                    <p className="text-gray-600">+1 (234) 567-8900</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-black rounded-full p-3 flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-primary-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">
                      Email
                    </h3>
                    <p className="text-gray-600">info@giaelectro.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gray-600 rounded-full p-3 flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-black mb-1">
                      Horario
                    </h3>
                    <p className="text-gray-600">
                      Lunes - Viernes: 9:00 AM - 7:00 PM
                      <br />
                      Sábados: 9:00 AM - 5:00 PM
                      <br />
                      Domingos: Cerrado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div>
            <h2 className="text-2xl font-bold text-primary-black mb-6">
              Envíanos un Mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="+1 (234) 567-8900"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <button type="submit" className="btn-secondary w-full">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        {/* Mapa de ubicación */}
        <div className="mt-12 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-primary-black mb-6 text-center">
            Nuestra Ubicación
          </h2>
          <div className="rounded-lg overflow-hidden shadow-lg bg-gray-200">
            <iframe
              src={`https://www.google.com/maps?q=-36.876725,-60.179608&hl=es&z=15&output=embed`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de GiA Electro"
            ></iframe>
            <div className="mt-4 text-center">
              <a
                href="https://maps.app.goo.gl/fUeZxUeq181Nx3hz6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-red hover:text-primary-yellow transition-colors font-medium"
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacto

