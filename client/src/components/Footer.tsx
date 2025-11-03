import React from 'react';
import { useTranslationStore } from '../stores/translationStore';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, language } = useTranslationStore();
  
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">HAWU Salon Network</h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              Empowering beauty and wellness professionals across Rwanda. We unite hairstylists, barbers, therapists, and beauty entrepreneurs to build sustainable careers and create transformative experiences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/hawusalonnetwork" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a 
                href="https://twitter.com/hawusalonnetwork" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center"
                aria-label="Twitter"
              >
                Twitter
              </a>
              <a 
                href="https://instagram.com/hawusalonnetwork" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 inline-flex items-center"
                aria-label="Instagram"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/salons" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Find Salons
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="/help" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/privacy" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/faq" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Additional Column for Balance */}
          <div className="space-y-6 hidden lg:block">
            <h4 className="text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/blog" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="/events" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Events
                </a>
              </li>
              <li>
                <a 
                  href="/sitemap" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors duration-200 text-sm sm:text-base"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 mt-12 pt-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © 2024 HAWU Salon Network. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
