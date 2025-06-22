import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';

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
    <section id="FAQ" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h4 className="text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-colors duration-200 cursor-default">Some Important FAQ's</h4>
            <h1 className="text-3xl font-bold text-gray-900 hover:text-black transition-colors duration-200 cursor-default">Common Questions</h1>
          </div>
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl shadow-md">
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
                    openIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 