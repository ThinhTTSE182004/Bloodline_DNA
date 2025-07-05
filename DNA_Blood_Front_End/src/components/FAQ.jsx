import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How accurate are Bloodline DNA tests?",
      answer: "Our tests use advanced DNA sequencing and are processed in ISO-accredited labs, ensuring results with 99.99% accuracy."
    },
    {
      question: "How is my privacy protected?",
      answer: "Your genetic data is encrypted and stored securely. We never share your information without explicit consent."
    },
    {
      question: "How long does it take to get results?",
      answer: "Results are typically available within 3 to 7 business days after we receive your sample."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="FAQ" className="py-16 bg-gray-50 h-full">
      <div className="h-full flex flex-col">
        <div className="mb-8">
          <motion.h4 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-colors duration-200 cursor-default">
              Some Important FAQ's
          </motion.h4>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 hover:text-black transition-colors duration-200 cursor-default">
              Common Questions
          </motion.h1>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4 bg-gray-200 p-6 rounded-xl shadow-md flex-1">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                  openIndex === index 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className={`group w-full p-6 text-left flex justify-between items-center transition-colors duration-200 ${
                    openIndex === index ? 'bg-blue-50' : 'bg-gray-100 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaQuestionCircle className={`text-xl flex-shrink-0 transition-colors duration-200 ${
                      openIndex === index ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                    }`} />
                    <h3 className={`text-xl font-semibold ${
                      openIndex === index ? 'text-blue-600' : 'text-gray-900'
                    } hover:text-blue-700 transition-colors duration-200 cursor-pointer`}>{faq.question}</h3>
                  </div>
                  {openIndex === index ? (
                    <FaChevronUp className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-text">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ; 