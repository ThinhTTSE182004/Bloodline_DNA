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
          <h4 className="text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-colors duration-200 cursor-default">Our Blog</h4>
          <h1 className="text-3xl font-bold text-gray-900 hover:text-black transition-colors duration-200 cursor-default">Latest Articles</h1>
          <p className="text-gray-700 mt-4 hover:text-gray-900 transition-colors duration-200 cursor-text">
            Stay updated with our latest news and health tips.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500 rounded-t-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-t-lg"></div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
                  <span className="group-hover:text-gray-900 transition-colors duration-300 cursor-default">
                    <FaUser className="text-blue-600 mr-1 inline" />{post.author}
                  </span>
                  <span className="group-hover:text-gray-900 transition-colors duration-300 cursor-default">
                    <FaCalendarAlt className="text-blue-600 mr-1 inline" />{post.date}
                  </span>
                  <span className="group-hover:text-gray-900 transition-colors duration-300 cursor-default">
                    <FaComment className="text-blue-600 mr-1 inline" />{post.comments} Comments
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mt-4 hover:text-gray-800 transition-colors duration-200 cursor-default">{post.title}</h3>
                <div className="mb-3 flex justify-center">
                  <span className="inline-block bg-primary text-black px-3 py-1 rounded-full text-sm transform group-hover:scale-105 transition-transform duration-300 cursor-default">
                    {post.category}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 hover:text-gray-900 transition-colors duration-200 cursor-text">{post.description}</p>
                <a 
                  href="#" 
                  className="text-primary hover:text-dark font-medium inline-flex items-center group-hover:translate-x-2 transition-all duration-300 cursor-pointer"
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