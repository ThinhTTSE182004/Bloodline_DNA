import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://localhost:7113/api/Admin/blogs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        console.log('Blogs loaded:', data);
        setBlogs(data);
        setError('');
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Cannot load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  // Strip HTML tags from content for preview
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get preview text (first 150 characters)
  const getPreviewText = (content) => {
    const text = stripHtml(content);
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  // Xử lý click card
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

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-lg border border-gray-200"
      >
        <div className="relative flex flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for articles..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled
          />
        </div>
        <div className="w-full md:w-60">
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 transition" disabled>
            <option>All Categories</option>
          </select>
        </div>
      </motion.div>

      {/* Blog Stats */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 text-center"
        >
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-600">{blogs.length}</span> blog posts
          </p>
        </motion.div>
      )}

      {/* Loading/Error */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center gap-3 text-blue-600 text-lg font-medium">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            Loading blogs...
          </div>
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 font-medium mb-2">Error Loading Blogs</div>
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Blog cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <div className="text-gray-600 font-medium mb-2">No Blogs Available</div>
                <div className="text-gray-500 text-sm">Check back later for new articles!</div>
              </div>
            </motion.div>
          )}
          {blogs.map((blog) => (
            <motion.div
              key={blog.blogId}
              whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(37,99,235,0.18)' }}
              className="bg-white border border-gray-100 rounded-2xl shadow-xl group cursor-pointer transition-all duration-300"
              onClick={() => handleCardClick(blog)}
            >
              <img
                src="/img/blog-1.png"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
