import React from 'react';

const FAQ = () => {
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

  return (
    <section id="FAQ" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h4 className="text-blue-600 font-semibold mb-4">Some Important FAQ's</h4>
            <h1 className="text-3xl font-bold text-gray-900">Common Questions</h1>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 