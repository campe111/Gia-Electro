import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

function Hero() {
  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-primary-black via-gray-900 to-primary-black text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Electrodomésticos de{' '}
            <span className="text-primary-yellow">Calidad</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Encuentra los mejores electrodomésticos para tu hogar. 
            Calidad, precio y garantía en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalogo"
              className="btn-primary inline-flex items-center justify-center space-x-2"
            >
              <span>Ver Catálogo</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/contacto"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-red opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-yellow opacity-10 rounded-full blur-3xl"></div>
    </section>
  )
}

export default Hero

