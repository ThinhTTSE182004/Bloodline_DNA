import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BlogListGuest = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://localhost:7113/api/Admin/public-blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogs(data);
        setError('');
      } catch (err) {
        setError('Cannot load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getPreviewText = (content) => {
    const text = stripHtml(content);
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const handleCardClick = (blog) => {
    navigate(`/blog/${blog.blogId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-bold text-center mb-10"
      >
        Blog List
      </motion.h1>

      {/* Blog cards */}
      {loading ? (
        <div className="text-center py-16 text-blue-600">Loading blogs...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500">No Blogs Available</div>
          ) : (
            blogs.map((blog) => (
              <motion.div
                key={blog.blogId}
                whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(37,99,235,0.18)' }}
                className="bg-white border border-gray-100 rounded-2xl shadow-xl group cursor-pointer transition-all duration-300"
                onClick={() => handleCardClick(blog)}
              >
                <img
                  src={blog.imageUrl || '/img/blog-1.png'}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {getPreviewText(blog.content)}
                  </p>
                  <div className="text-xs text-gray-500">
                    {formatDate(blog.createdAt)} • Author ID: {blog.authorId}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BlogListGuest;