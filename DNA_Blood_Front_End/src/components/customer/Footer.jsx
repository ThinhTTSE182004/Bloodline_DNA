import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedinIn, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200 cursor-default">DNA Lab</h3>
            <p className="text-sm hover:text-gray-100 transition-colors duration-200 cursor-default">
              Leading the way in genetic testing and DNA analysis. Discover your story with our advanced technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">Facebook</span>
                <FaFacebook className="h-6 w-6 hover:text-blue-600 transition-colors duration-300" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-6 w-6 hover:text-blue-400 transition-colors duration-300" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <span className="sr-only">LinkedIn</span>
                <FaLinkedinIn className="h-6 w-6 hover:text-blue-500 transition-colors duration-300" />
              </a>
            </div>
          </div>


          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors duration-200 cursor-default">Our Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Ancestry DNA Test</a></li>
              <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Health DNA Test</a></li>
              <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Paternity Test</a></li>
              <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Genetic Counseling</a></li>
              <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Research Services</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors duration-200 cursor-default">Contact Us</h3>
            <p className="hover:text-white transition-colors cursor-default">123 DNA Street</p>
            <p className="hover:text-white transition-colors cursor-default">New York, NY 10001</p>
            <p className="hover:text-white transition-colors cursor-default">Phone: (555) 123-4567</p>
            <p className="hover:text-white transition-colors cursor-default">Email: info@bloodlinedna.com</p>
          </div>

          {/* Image Column */}
          <div className="flex items-center justify-end pr-4">
            <img src="/img/logo.png" alt="Footer Logo" className="w-40 h-40 object-contain rounded-xl shadow-lg" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm hover:text-gray-100 transition-colors duration-200 cursor-default">
              © {new Date().getFullYear()} DNA Lab. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              <a href="#" className="text-sm hover:text-white transition-colors cursor-pointer">Terms of Service</a>
              <a href="#" className="text-sm hover:text-white transition-colors cursor-pointer">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 