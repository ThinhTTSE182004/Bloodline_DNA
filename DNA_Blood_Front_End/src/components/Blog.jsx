import React from 'react';
import { FaUser, FaCalendarAlt, FaComment, FaArrowRight } from 'react-icons/fa';

const Blog = () => {
  const blogPosts = [
    {
      image: "/img/blog-1.png",
      category: "DNA Basics",
      author: "Bloodline Expert",
      date: "10 Apr 2025",
      comments: 12,
      title: "What Your DNA Can Reveal About You",
      description: "Discover the types of information a DNA test can provide, from ancestry to health predispositions."
    },
    {
      image: "/img/blog-2.png",
      category: "Customer Stories",
      author: "Client Spotlight",
      date: "25 Mar 2025",
      comments: 8,
      title: "How a DNA Test Reunited My Family",
      description: "A touching story of how one customer used Bloodline DNA to discover unknown relatives and reconnect with their roots."
    },
    {
      image: "/img/blog-3.png",
      category: "Health Insights",
      author: "Health Team",
      date: "5 Feb 2025",
      comments: 10,
      title: "Understanding Your Genetic Health Report",
      description: "Learn how to interpret the health risks and carrier information in your Bloodline DNA health report."
    }
  ];

  return (
    <section id="blog" className="py-16 bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h4 className="text-primary font-semibold mb-4">From Our Blog</h4>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Insights & News from Bloodline DNA</h1>
          <p className="text-lg text-gray-600">
            Explore expert articles, updates, and insights about DNA testing, health, ancestry, and how genetics can impact your life.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between text-sm text-gray-500 mb-4 whitespace-nowrap overflow-hidden">
                  <span className="group-hover:text-primary transition-colors duration-300 flex-shrink-0">
                    <FaUser className="text-blue-600 mr-1" />{post.author}
                  </span>
                  <span className="group-hover:text-primary transition-colors duration-300 flex-shrink-0 mx-1">
                    <FaCalendarAlt className="text-blue-600 mr-1" />{post.date}
                  </span>
                  <span className="group-hover:text-primary transition-colors duration-300 flex-shrink-0">
                    <FaComment className="text-blue-600 mr-1" />{post.comments} Comments
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>
                <div className="mb-3">
                  <span className="inline-block bg-primary text-black px-3 py-1 rounded-full text-sm transform group-hover:scale-105 transition-transform duration-300">
                    {post.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                  {post.description}
                </p>
                <a 
                  href="#" 
                  className="text-primary hover:text-dark font-medium inline-flex items-center group-hover:translate-x-2 transition-all duration-300"
                >
                  Read More <FaArrowRight className="ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog; 