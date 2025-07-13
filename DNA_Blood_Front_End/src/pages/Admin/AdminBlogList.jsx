import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiEdit, FiTrash2, FiPlusCircle, FiEye, FiCheck, FiPause, FiArrowLeft,
  FiBold, FiItalic, FiUnderline, FiLink, FiImage, 
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, FiList,
  FiSearch, FiFilter, FiX, FiCalendar, FiUser, FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['undo', 'redo'],
    ['clean']
  ],
  history: {
    delay: 1000,
    maxStack: 100,
    userOnly: true
  }
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link', 'image', 'video',
  'clean'
];

// Cấu trúc dữ liệu blog từ API
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const AdminBlogList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null); // Blog đang edit
  const [viewBlog, setViewBlog] = useState(null); // Blog đang xem chi tiết
  const [blogs, setBlogs] = useState([]); // Dữ liệu blog từ API
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  const navigate = useNavigate();

  // Fetch blogs từ API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('https://localhost:7113/api/Admin/blogs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      setBlogs(data);
      setFilteredBlogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load blogs khi component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter and search blogs
  useEffect(() => {
    let filtered = [...blogs];

    // Search by title
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status (if blogs have a status field)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(blog => blog.status === statusFilter);
    }

    // Filter by author
    if (authorFilter) {
      filtered = filtered.filter(blog =>
        blog.authorId.toString().includes(authorFilter) ||
        (blog.authorName && blog.authorName.toLowerCase().includes(authorFilter.toLowerCase()))
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(blog => {
        const blogDate = new Date(blog.createdAt);
        switch (dateFilter) {
          case 'today':
            return blogDate >= today;
          case 'week':
            return blogDate >= weekAgo;
          case 'month':
            return blogDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort blogs
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.authorName || a.authorId).toString().localeCompare((b.authorName || b.authorId).toString());
        default:
          return dateB - dateA;
      }
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, statusFilter, dateFilter, authorFilter, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setAuthorFilter('');
    setSortBy('newest');
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm || dateFilter !== 'all' || authorFilter || sortBy !== 'newest';

  // Hàm xóa blog
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`https://localhost:7113/api/Admin/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }

      // Refresh danh sách blog
      await fetchBlogs();
      alert('Blog deleted successfully!');
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Error deleting blog!');
    }
  };

  // Popup Edit Card
  const EditBlogCard = ({ blog, onClose }) => {
    const [title, setTitle] = useState(blog.title);
    const [content, setContent] = useState(blog.content || '<p>Blog content...</p>');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleUpdate = async () => {
      if (!title || !content) {
        alert('Please enter both title and content!');
        return;
      }
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const requestBody = {
          blogId: blog.blogId,
          title,
          content
        };
        const response = await fetch(`https://localhost:7113/api/Admin/blogs/${blog.blogId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 405) {
            const postResponse = await fetch(`https://localhost:7113/api/Admin/blogs/${blog.blogId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(requestBody)
            });
            if (!postResponse.ok) {
              const postErrorText = await postResponse.text();
              throw new Error(`Failed to update blog (POST): ${postResponse.status} - ${postErrorText}`);
            }
            await postResponse.json();
          } else {
            throw new Error(`Failed to update blog: ${response.status} - ${errorText}`);
          }
        } else {
          await response.json();
        }
        await fetchBlogs();
        onClose();
        alert('Blog updated successfully!');
      } catch (err) {
        alert(`Error updating blog: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/70 via-white/60 to-green-100/70 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-6xl mx-auto bg-white/95 shadow-2xl rounded-3xl p-10 border border-blue-100 z-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#e0e7ff' }}
              className="p-2 rounded-full bg-blue-50 text-blue-600 shadow hover:bg-blue-100 transition"
              onClick={onClose}
              title="Back"
            >
              <FiArrowLeft className="text-xl" />
            </motion.button>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl sm:text-3xl font-extrabold text-blue-700 drop-shadow-lg"
            >
              Edit Blog Post
            </motion.h2>
          </div>
          {/* Title */}
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#2563eb' }}
            type="text"
            placeholder="Blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-blue-200 rounded-2xl px-5 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all text-lg"
          />
          {/* Content Editor Card */}
          <div className={`w-full flex flex-col h-[300px] bg-white rounded-3xl border transition-all duration-300 ${isFocused ? 'border-blue-400 shadow-2xl ring-2 ring-blue-200' : 'border-blue-100 shadow'} quill-placeholder-indent`}>
            <div className="flex flex-col p-6 quill-fix-placeholder
              [&_.ql-toolbar]:flex [&_.ql-toolbar]:flex-nowrap [&_.ql-toolbar]:items-center
              [&_.ql-toolbar]:gap-2 [&_.ql-toolbar]:text-xl
              [&_.ql-toolbar]:min-h-[56px] [&_.ql-toolbar]:py-3
              [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:rounded-none [&_.ql-toolbar]:bg-transparent
              [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-blue-100
              [&_.ql-container]:h-[200px] [&_.ql-container]:max-h-[200px] [&_.ql-container]:overflow-y-auto [&_.ql-container]:overflow-x-hidden [&_.ql-container]:border-0
              [&_.ql-editor]:rounded-none [&_.ql-editor]:bg-transparent [&_.ql-editor]:pt-3 [&_.ql-editor]:px-6 [&_.ql-editor]:pb-3 [&_.ql-editor]:break-words [&_.ql-editor]:whitespace-pre-line [&_.ql-editor]:text-lg">
              <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write your blog content here..."
              className="h-full min-h-[150px] w-full flex-1"
              modules={quillModules}
              formats={quillFormats}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            </div>
          </div>
          {/* Nút Update/Cancel ngoài card nhỏ */}
          <div className="w-full flex justify-end mt-8">
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: '#4ade80' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUpdate}
              disabled={loading}
              className={`px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating...' : 'Update'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: '#fecaca' }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              disabled={loading}
              className="ml-4 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-lg shadow transition-all flex items-center gap-2"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Popup View Blog Card
  const ViewBlogCard = ({ blog, onClose }) => {
    const [imageError, setImageError] = useState(false);
    
    // Extract first image from content if exists
    const extractImageFromContent = (content) => {
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const match = imgRegex.exec(content);
      return match ? match[1] : null;
    };

    // Ưu tiên lấy blog.imageUrl, nếu không có thì mới lấy ảnh trong content
    const blogImage = blog.imageUrl || extractImageFromContent(blog.content) || '/img/blog-default.jpg';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/70 via-white/60 to-green-100/70 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
          className="w-full max-w-4xl mx-4 bg-white/95 shadow-2xl rounded-3xl border border-blue-100 z-10 max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl sm:text-3xl font-extrabold text-blue-700 drop-shadow-lg"
            >
              Blog Details
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#fecaca' }}
              className="p-2 rounded-full bg-red-50 text-red-600 shadow hover:bg-red-100 transition"
              onClick={onClose}
              title="Close"
            >
              <FiX className="text-xl" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Blog Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6"
            >
              <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
                {!imageError ? (
                  <img
                    src={blogImage}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                    <div className="text-center">
                      <FiImage className="text-6xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No image available</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>

            {/* Blog Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                  {blog.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FiUser className="text-gray-400" />
                    <span>Author ID: {blog.authorId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar className="text-gray-400" />
                    <span>Created: {formatDate(blog.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Blog ID */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Blog ID:</span>
                  <code className="bg-white px-2 py-1 rounded border text-blue-600">
                    {blog.blogId}
                  </code>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiEdit className="text-blue-600" />
                  Content
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content available</p>' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap gap-3 pt-4 border-t border-gray-100"
              >
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#fde68a' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditBlog(blog);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all shadow"
                >
                  <FiEdit className="text-lg" />
                  Edit Blog
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#fecaca' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    handleDeleteBlog(blog.blogId);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow"
                >
                  <FiTrash2 className="text-lg" />
                  Delete Blog
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#e0e7ff' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/blog/${blog.blogId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow"
                >
                  <FiEye className="text-lg" />
                  View Public Page
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Popup Edit Card */}
      {editBlog && <EditBlogCard blog={editBlog} onClose={() => setEditBlog(null)} />}
      {/* Popup View Card */}
      {viewBlog && <ViewBlogCard blog={viewBlog} onClose={() => setViewBlog(null)} />}
      {/* Sửa placeholder React Quill bằng style nội tuyến */}
      <style>{`
        .ql-editor.ql-blank::before {
          left: 0 !important;
          padding-left: 0 !important;
          text-align: left !important;
          font-style: normal !important;
          opacity: 0.6;
        }
      `}</style>
      <div className="py-4 px-2 sm:px-4 min-h-screen bg-gray-50 transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[95vw] mx-auto bg-white shadow-2xl rounded-3xl p-10"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-green-700"
            >
              Blog Management
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/admin/blogs-create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow transition-all"
            >
              <FiPlusCircle className="text-xl" />
              Create
            </motion.button>
          </div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search blogs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiFilter className="text-lg" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[searchTerm, dateFilter, authorFilter].filter(Boolean).length}
                  </span>
                )}
              </motion.button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all"
                >
                  <FiX className="text-lg" />
                  Clear
                </motion.button>
              )}

              {/* Results Count */}
              <div className="ml-auto text-sm text-gray-600">
                Showing {filteredBlogs.length} of {blogs.length} blogs
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl"
                >
                  {/* Status Filter - Disabled since no status field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      <FiCheck className="inline mr-2" />
                      Status (Coming Soon)
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                    >
                      <option value="all">All Status</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiCalendar className="inline mr-2" />
                      Date Range
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>

                  {/* Author Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-2" />
                      Author
                    </label>
                    <input
                      type="text"
                      placeholder="Search by author..."
                      value={authorFilter}
                      onChange={(e) => setAuthorFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiClock className="inline mr-2" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                      <option value="author">Author A-Z</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading blogs...</span>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <div className="text-red-600 font-medium">{error}</div>
                <button
                  onClick={fetchBlogs}
                  className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {/* No Results */}
          {!loading && !error && filteredBlogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-500 text-lg mb-4">
                {hasActiveFilters ? 'No blogs match your filters.' : 'No blogs found.'}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}

          {/* Blog Table */}
          {!loading && !error && filteredBlogs.length > 0 && (
            <div>
              <motion.table
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full table-fixed text-sm text-left border-collapse"
              >
                <thead className="bg-green-100 text-green-900">
                  <tr>
                    <th className="p-3 font-semibold">#</th>
                    <th className="p-3 font-semibold">Title</th>
                    <th className="p-3 font-semibold">Created Date</th>
                    <th className="p-3 font-semibold">Author ID</th>
                    <th className="p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog, index) => (
                    <motion.tr
                      key={blog.blogId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, backgroundColor: '#f0fdf4', boxShadow: '0 2px 8px #22c55e22' }}
                      className="border-b transition-all duration-200"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{blog.title}</td>
                                              <td className="p-3">{formatDate(blog.createdAt)}</td>
                        <td className="p-3">{blog.authorId}</td>
                        <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                                                      <motion.button
                              whileHover={{ scale: 1.15, backgroundColor: '#bbf7d0' }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
                              title="View Details"
                              onClick={() => setViewBlog(blog)}
                            >
                              <FiEye />
                            </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15, backgroundColor: '#fde68a' }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded"
                            title="Edit"
                            onClick={() => setEditBlog(blog)}
                          >
                            <FiEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15, backgroundColor: '#fecaca' }}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                            title="Delete"
                            onClick={() => handleDeleteBlog(blog.blogId)}
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AdminBlogList;
