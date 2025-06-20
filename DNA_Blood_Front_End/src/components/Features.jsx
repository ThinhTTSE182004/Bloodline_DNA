import React from 'react';
import { motion } from 'framer-motion';
import { FaFlask, FaUserShield, FaChartLine, FaClock, FaGlobe, FaHeadset } from 'react-icons/fa';

const features = [
  {
    icon: <FaFlask className="w-8 h-8" />,
    title: "Advanced Technology",
    description: "State-of-the-art DNA testing equipment and methodologies for accurate results."
  },
  {
    icon: <FaUserShield className="w-8 h-8" />,
    title: "Privacy Guaranteed",
    description: "Your data is protected with industry-leading security measures and strict confidentiality."
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: "High Accuracy",
    description: "99.9% accuracy rate in all our DNA testing services and results."
  },
  {
    icon: <FaClock className="w-8 h-8" />,
    title: "Quick Results",
    description: "Fast turnaround time with detailed reports and expert analysis."
  },
  {
    icon: <FaGlobe className="w-8 h-8" />,
    title: "Global Standards",
    description: "Compliant with international DNA testing standards and regulations."
  },
  {
    icon: <FaHeadset className="w-8 h-8" />,
    title: "24/7 Support",
    description: "Round-the-clock customer support for all your queries and concerns."
  }
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Why Choose Our DNA Testing Services?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            We provide comprehensive DNA testing solutions with cutting-edge technology
            and exceptional customer service.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Features; 