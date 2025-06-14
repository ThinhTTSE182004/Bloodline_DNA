import React from 'react';
import { scrollToSection } from '../utils/scroll';
import { FaDna, FaUsers, FaLock, FaBolt, FaArrowRight } from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      title: "Advanced DNA Analysis",
      description: "State-of-the-art technology for precise genetic testing and analysis.",
      icon: (<FaDna className="w-8 h-8" />)
    },
    {
      title: "Expert Genetic Counselors",
      description: "Professional guidance from certified genetic counselors throughout your journey.",
      icon: (<FaUsers className="w-8 h-8" />)
    },
    {
      title: "Secure & Confidential",
      description: "Your genetic data is protected with industry-leading security measures.",
      icon: (<FaLock className="w-8 h-8" />)
    },
    {
      title: "Fast Results",
      description: "Get your results quickly with our efficient processing system.",
      icon: (<FaBolt className="w-8 h-8" />)
    }
  ];

  return (
    <div id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900 sm:text-4xl">
            Why Choose Our DNA Testing Services?
          </h2>
          <p className="mt-4 text-lg text-blue-700">
            Experience the best in genetic testing with our comprehensive features
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-100"
            >
              <div className="absolute -top-4 left-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                  {feature.icon}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-blue-700">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 bg-white rounded-lg p-8 shadow-lg border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-blue-900">
                Ready to Discover Your Genetic Story?
              </h3>
              <p className="mt-4 text-blue-700">
                Take the first step towards understanding your genetic makeup and heritage.
                Our expert team is here to guide you through every step of the process.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Started
                  <FaArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <FaDna className="w-64 h-64 text-blue-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 