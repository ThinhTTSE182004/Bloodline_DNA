import React, { useEffect, useState } from 'react';
import { FaUser, FaCalendarAlt, FaComment, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('https://localhost:7113/api/Admin/public-blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Lấy preview text từ content (loại bỏ thẻ HTML)
  const getPreviewText = (content) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = content || '';
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  return (
    <section id="blog" className="py-16 bg-light h-full">
      <div className="h-full flex flex-col">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <motion.h4 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-colors duration-200 cursor-default">
              Our Blog
            </motion.h4>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 hover:text-black transition-colors duration-200 cursor-default">
              Latest Articles
            </motion.h1>
          <motion.p 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-700 mt-4 hover:text-gray-900 transition-colors duration-200 cursor-text">
              Stay updated with our latest news and health tips.
          </motion.p>
        </div>
        <motion.div 
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: 0.3 }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
  {loading ? (
    <div className="col-span-full text-center py-16 text-blue-600">Loading blogs...</div>
  ) : blogs.length === 0 ? (
    <div className="col-span-full text-center py-16 text-gray-500">No Blogs Available</div>
  ) : (
    blogs.slice(0, 3).map((post, index) => (
              <div 
                key={post.blogId} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.imageUrl || '/img/blog-1.png'} 
                    alt={post.title} 
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500 rounded-t-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-t-lg"></div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
                    <span className="group-hover:text-gray-900 transition-colors duration-300 cursor-default">
                      <FaUser className="text-blue-600 mr-1 inline" />{post.authorName || post.authorId}
                    </span>
                    <span className="group-hover:text-gray-900 transition-colors duration-300 cursor-default">
                      <FaCalendarAlt className="text-blue-600 mr-1 inline" />{new Date(post.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mt-4 hover:text-gray-800 transition-colors duration-200 cursor-default">{post.title}</h3>
                  <div className="mb-3 flex justify-center">
                    {post.category && (
                      <span className="inline-block bg-primary text-black px-3 py-1 rounded-full text-sm transform group-hover:scale-105 transition-transform duration-300 cursor-default">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-2 hover:text-gray-900 transition-colors duration-200 cursor-text">
                    {getPreviewText(post.content)}
                  </p>
                  <button
                    onClick={() => window.location.href = `/blog/${post.blogId}`}
                    className="text-primary hover:text-dark font-medium inline-flex items-center group-hover:translate-x-2 transition-all duration-300 cursor-pointer mt-2"
                  >
                    Read More <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
        {/* Nút xem tất cả bài viết - căn giữa */}
<div className="flex justify-center mt-8">
  <Link
    to="/blog"
    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
  >
    View All Blogs
  </Link>
</div>
        
      </div>
    </section>
  );
};

export default Blog;