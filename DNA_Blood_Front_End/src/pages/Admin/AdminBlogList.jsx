import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiEdit, FiTrash2, FiPlusCircle, FiEye, FiCheck, FiPause, FiArrowLeft,
  FiBold, FiItalic, FiUnderline, FiLink, FiImage, 
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, FiList
} from 'react-icons/fi';
import { motion } from 'framer-motion';
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
  const [blogs, setBlogs] = useState([]); // Dữ liệu blog từ API
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
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

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Popup Edit Card */}
      {editBlog && <EditBlogCard blog={editBlog} onClose={() => setEditBlog(null)} />}
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
          {/* Tiêu đề + nút tạo mới */}
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

          {/* Bảng quản lý blog */}
          {!loading && !error && (
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
                  {blogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No blogs found. Create your first blog!
                      </td>
                    </tr>
                  ) : (
                    blogs.map((blog, index) => (
                      <motion.tr
                        key={blog.blogId}
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
                              title="View"
                              onClick={() => navigate(`/blog/${blog.blogId}`)}
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
                    ))
                  )}
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
