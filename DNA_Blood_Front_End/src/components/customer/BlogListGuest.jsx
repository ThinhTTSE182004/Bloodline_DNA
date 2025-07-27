import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BlogListGuest = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const startIdx = (currentPage - 1) * blogsPerPage;
  const endIdx = startIdx + blogsPerPage;
  const blogsToShow = blogs.slice(startIdx, endIdx);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/Admin/public-blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        // Sắp xếp blog mới nhất lên đầu
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      <button
        onClick={() => navigate('/')}
        className="mb-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow"
      >
        Back to Home
      </button>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block p-1 bg-blue-100 rounded-full">
            {/* Newspaper/news icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14ZM7 7h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h7v2H7v-2Z"/></svg>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 border-b-2 border-blue-200 px-2 pb-1 text-center">
            Blog List
          </h1>
        </div>
        <p className="text-base text-gray-500 font-normal mt-1 text-center max-w-xl">
          A collection of the latest articles, news, and stories about DNA & blood testing.
        </p>
      </motion.div>

      {/* Blog cards */}
      {loading ? (
        <div className="text-center py-16 text-blue-600">Loading blogs...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogsToShow.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-500">No Blogs Available</div>
            ) : (
              blogsToShow.map((blog) => (
                <motion.div
                  key={blog.blogId}
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(37,99,235,0.18)' }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-xl group cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1"
                  onClick={() => handleCardClick(blog)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={blog.imageUrl || '/img/blog-1.png'}
                      alt={blog.title}
                      className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500 rounded-t-2xl shadow-lg"
                    />
                  </div>
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
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  setTimeout(() => window.scrollTo(0, 0), 100);
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo(0, 0);
                    }}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  setTimeout(() => window.scrollTo(0, 0), 100);
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogListGuest;