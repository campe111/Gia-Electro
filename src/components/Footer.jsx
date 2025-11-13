import { Link } from 'react-router-dom'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

function Footer() {
  return (
    <footer className="bg-primary-black text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div>
            <h3 className="text-primary-yellow text-xl font-bold mb-4">
              GiA Electro
            </h3>
            <p className="text-sm">
              Tu tienda de confianza para electrodomésticos de calidad. 
              Ofrecemos los mejores productos al mejor precio.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-primary-yellow text-xl font-bold mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="hover:text-primary-yellow transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo"
                  className="hover:text-primary-yellow transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="hover:text-primary-yellow transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-primary-yellow text-xl font-bold mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPinIcon className="h-5 w-5 text-primary-red flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Dirección de la tienda, Ciudad, País
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-primary-red flex-shrink-0" />
                <span className="text-sm">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-primary-red flex-shrink-0" />
                <span className="text-sm">info@giaelectro.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>
            © {new Date().getFullYear()} GiA Electro. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

