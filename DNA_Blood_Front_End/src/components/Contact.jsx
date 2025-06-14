import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    service: 'ancestry'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div id="contact" className="py-20 bg-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Have questions? We're here to help you understand your genetic journey
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="bg-blue-900 p-8 rounded-lg shadow-sm border border-blue-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-100">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-blue-700 bg-blue-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-100">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-blue-700 bg-blue-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-100">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-blue-700 bg-blue-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-blue-100">
                  Service Interested In
                </label>
                <select
                  name="service"
                  id="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-blue-700 bg-blue-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ancestry">Ancestry Testing</option>
                  <option value="health">Health Testing</option>
                  <option value="paternity">Paternity Testing</option>
                  <option value="other">Other Services</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-blue-100">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-blue-700 bg-blue-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 border-2 border-blue-400 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-900 p-8 rounded-lg shadow-sm border border-blue-700">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white">Contact Information</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <FaPhoneAlt className="w-6 h-6 text-blue-300" />
                    <span className="ml-3 text-blue-100">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="w-6 h-6 text-blue-300" />
                    <span className="ml-3 text-blue-100">info@dnatesting.com</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="w-6 h-6 text-blue-300" />
                    <span className="ml-3 text-blue-100">123 DNA Street, Genetic City, GC 12345</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">Business Hours</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-blue-100">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-blue-100">Saturday: 10:00 AM - 4:00 PM</p>
                  <p className="text-blue-100">Sunday: Closed</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white">Follow Us</h3>
                <div className="mt-4 flex space-x-4">
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    <FaFacebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    <FaTwitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-blue-300 hover:text-blue-100">
                    <FaInstagram className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 