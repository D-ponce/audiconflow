import React from 'react';
import Icon from '../AppIcon';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Sección de la Empresa */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={32} className="text-violet-300" />
              <h3 className="text-2xl font-bold text-white">AudiconFlow</h3>
            </div>
            <p className="text-violet-200 text-sm leading-relaxed">
              Plataforma líder en gestión profesional de auditorías retail. 
              Optimizamos procesos, garantizamos cumplimiento y potenciamos 
              la eficiencia operacional de tu negocio.
            </p>
            <div className="flex items-center space-x-2 text-violet-300">
              <Icon name="MapPin" size={16} />
              <span className="text-sm">Soluciones empresariales globales</span>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white border-b border-violet-700 pb-2">
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-violet-200 hover:text-white transition-colors">
                <Icon name="Mail" size={16} className="text-violet-300" />
                <a href="mailto:contacto@audiconflow.com" className="text-sm hover:underline">
                  contacto@audiconflow.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-violet-200 hover:text-white transition-colors">
                <Icon name="Phone" size={16} className="text-violet-300" />
                <a>
                  +56 9 5678900
                </a>
              </div>
              <div className="flex items-center space-x-3 text-violet-200">
                <Icon name="Clock" size={16} className="text-violet-300" />
                <span className="text-sm">Lun - Vie: 9:00 - 18:00</span>
              </div>
            </div>
          </div>

          {/* Enlaces Legales */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white border-b border-violet-700 pb-2">
              Legal
            </h4>
            <div className="space-y-3">
              <a 
                
                className="flex items-center space-x-2 text-violet-200 hover:text-white transition-colors"
              >
                <Icon name="FileText" size={14} className="text-violet-300" />
                <span>Términos y Condiciones</span>
              </a>
              <a 
                 
                className="flex items-center space-x-2 text-violet-200 hover:text-white transition-colors"
              >
                <Icon name="Shield" size={14} className="text-violet-300" />
                <span>Política de Privacidad</span>
              </a>
              <a 
                
                className="flex items-center space-x-2 text-violet-200 hover:text-white transition-colors"
              >
                <Icon name="Settings" size={14} className="text-violet-300" />
                <span>Política de Cookies</span>
              </a>
              <a 
                
                className="flex items-center space-x-2 text-violet-200 hover:text-white transition-colors"
              >
                <Icon name="Info" size={14} className="text-violet-300" />
                <span>Aviso Legal</span>
              </a>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white border-b border-violet-700 pb-2">
              Síguenos
            </h4>
            <div className="space-y-3">
              <a 
                href="https://linkedin.com/company/audiconflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-violet-200 hover:text-white transition-colors group"
              >
                <div className="bg-violet-800 p-2 rounded-lg group-hover:bg-violet-700 transition-colors">
                  <Icon name="Linkedin" size={16} className="text-white" />
                </div>
                <span className="text-sm">LinkedIn</span>
              </a>
              <a 
                href="https://twitter.com/audiconflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-violet-200 hover:text-white transition-colors group"
              >
                <div className="bg-violet-800 p-2 rounded-lg group-hover:bg-violet-700 transition-colors">
                  <Icon name="Twitter" size={16} className="text-white" />
                </div>
                <span className="text-sm">Twitter</span>
              </a>
              <a 
                href="https://facebook.com/audiconflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-violet-200 hover:text-white transition-colors group"
              >
                <div className="bg-violet-800 p-2 rounded-lg group-hover:bg-violet-700 transition-colors">
                  <Icon name="Facebook" size={16} className="text-white" />
                </div>
                <span className="text-sm">Facebook</span>
              </a>
              <a 
                href="https://youtube.com/@audiconflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-violet-200 hover:text-white transition-colors group"
              >
                <div className="bg-violet-800 p-2 rounded-lg group-hover:bg-violet-700 transition-colors">
                  <Icon name="Youtube" size={16} className="text-white" />
                </div>
                <span className="text-sm">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-violet-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-violet-300 text-sm">
              <span>© {new Date().getFullYear()} AudiconFlow. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center space-x-4 text-violet-300 text-sm">
              <span>Versión 2.1.0</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistema Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
