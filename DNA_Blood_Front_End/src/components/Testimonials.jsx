import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const Testimonials = () => {
  const testimonials = [
    {
      content: "The DNA testing process was incredibly smooth and professional. The results were detailed and helped me understand my family history better.",
      author: "Sarah Johnson",
      role: "Ancestry Test Customer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "I was amazed by the accuracy and depth of the health insights provided. The genetic counselors were extremely helpful in explaining the results.",
      author: "Michael Chen",
      role: "Health Test Customer",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "The customer service was outstanding throughout the entire process. They made a complex subject easy to understand.",
      author: "Emily Rodriguez",
      role: "Paternity Test Customer",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  return (
    <div id="testimonials" className="py-20 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl hover:text-black transition-colors duration-200 cursor-default">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-gray-700 hover:text-gray-800 transition-colors duration-200 cursor-default">
            Trusted by thousands of customers worldwide
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-primary-200"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  <FaQuoteLeft className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-800 italic hover:text-black transition-colors duration-200 cursor-text">
                  "{testimonial.content}"
                </p>
                <div className="mt-6 flex items-center">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-800 hover:text-black transition-colors duration-200 cursor-default">
                      {testimonial.author}
                    </h4>
                    <p className="text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-default">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-default">98%</div>
              <p className="mt-2 text-primary-700 hover:text-primary-800 transition-colors duration-200 cursor-default">Customer Satisfaction</p>
            </div>
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-default">50K+</div>
              <p className="mt-2 text-primary-700 hover:text-primary-800 transition-colors duration-200 cursor-default">Tests Completed</p>
            </div>
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-default">24/7</div>
              <p className="mt-2 text-primary-700 hover:text-primary-800 transition-colors duration-200 cursor-default">Support Available</p>
            </div>
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-default">99.9%</div>
              <p className="mt-2 text-primary-700 hover:text-primary-800 transition-colors duration-200 cursor-default">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 