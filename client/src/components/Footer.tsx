import React from 'react';
import { useTranslationStore } from '../stores/translationStore';

const Footer: React.FC = () => {
  const { t, language } = useTranslationStore();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{t('hawurwanda20', language)}</h3>
            <p className="text-gray-300 mb-4">
              {t('footerDescription', language)}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                {t('facebook', language)}
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                {t('twitter', language)}
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                {t('instagram', language)}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/salons" className="text-gray-300 hover:text-white text-sm">
                  Find Salons
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white text-sm">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2024 HAWU Salon Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
