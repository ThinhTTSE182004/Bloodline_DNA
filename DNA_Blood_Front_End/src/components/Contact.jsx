import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
    <div id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 sm:text-4xl hover:text-black">
            Get in Touch
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1  }}
            className="mt-4 text-lg text-gray-700 hover:text-gray-800">
            Have questions? We're here to help you understand your genetic journey
          </motion.p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-700 p-8 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}>
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-white text-black shadow-sm focus:border-gray-200 focus:ring-gray-200"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-white text-black shadow-sm focus:border-gray-200 focus:ring-gray-200"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}>
                <label htmlFor="phone" className="block text-sm font-medium text-white">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-white text-black shadow-sm focus:border-gray-200 focus:ring-gray-200"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}>
                <label htmlFor="service" className="block text-sm font-medium text-white">
                  Service Interested In
                </label>
                <select
                  name="service"
                  id="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-white text-black shadow-sm focus:border-gray-200 focus:ring-gray-200"
                >
                  <option value="ancestry">Ancestry Testing</option>
                  <option value="health">Health Testing</option>
                  <option value="paternity">Paternity Testing</option>
                  <option value="other">Other Services</option>
                </select>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}>
                <label htmlFor="message" className="block text-sm font-medium text-white">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-200 bg-white text-black shadow-sm focus:border-gray-200 focus:ring-gray-200"
                ></textarea>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                type="submit"
                className="w-full px-6 py-3 border-2 border-blue-400 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-700 p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-8">
              <div>
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl font-semibold text-gray-50 hover:text-white">
                    Contact Information
                </motion.h3>
                <div className="mt-4 space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center">
                    <FaPhoneAlt className="w-6 h-6 text-gray-50" />
                    <span className="ml-3 text-gray-50">+1 (555) 123-4567</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center">
                    <FaEnvelope className="w-6 h-6 text-gray-50" />
                    <span className="ml-3 text-gray-50">info@dnatesting.com</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex items-center">
                    <FaMapMarkerAlt className="w-6 h-6 text-gray-50" />
                    <span className="ml-3 text-gray-50">123 DNA Street, Genetic City, GC 12345</span>
                  </motion.div>
                </ div>
              </div>

              <div>
              <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl font-semibold text-gray-50 hover:text-white">
                    Business Hours
                </motion.h3>
                <div className="mt-4 space-y-2">
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-gray-50">
                      Monday - Friday: 9:00 AM - 6:00 PM
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-gray-50">
                      Saturday: 10:00 AM - 4:00 PM
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-gray-50">
                      Sunday: Closed
                  </motion.p>
                </div>
              </div>

              <div>
                <motion.h3 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl font-semibold text-gray-50 hover:text-white">
                    Follow Us
                </motion.h3>
                <div className="mt-4 flex space-x-4">
                  <motion.a
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }} 
                    href="#" 
                    className="text-gray-50 hover:text-blue-600">
                    <FaFacebook className="w-6 h-6" />
                  </motion.a>
                  <motion.a 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }} 
                    href="#" 
                    className="text-gray-50 hover:text-blue-400 transition-colors duration-300">
                    <FaTwitter className="w-6 h-6" />
                  </motion.a>
                  <motion.a 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }} 
                    href="#" 
                    className="text-gray-50 hover:text-pink-500 transition-colors duration-300">
                    <FaInstagram className="w-6 h-6" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 