import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';

const AdminCreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Please enter both title and content!');
      return;
    }
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/Admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          content
        })
      });
      if (!res.ok) throw new Error('Failed to create blog');
      // Success
      navigate('/admin/blogs');
    } catch (err) {
      alert('Error creating blog!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-2 sm:px-4">
      {/* Navbar luôn render trước */}
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      {/* Sidebar render sau để đè lên navbar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Overlay mờ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Nội dung chính */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white/90 shadow-2xl rounded-3xl p-2 sm:p-8 border border-blue-100 backdrop-blur-md mt-8 relative z-10"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#e0e7ff' }}
            className="p-2 rounded-full bg-blue-50 text-blue-600 shadow hover:bg-blue-100 transition"
            onClick={() => navigate('/admin/blogs')}
            title="Back to list"
          >
            <FiArrowLeft className="text-xl" />
          </motion.button>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-extrabold text-blue-700 drop-shadow-lg"
          >
            Create New Blog Post
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

        {/* Content Editor */}
        <div className="mt-4 mb-6 bg-blue-50/50 rounded-2xl shadow-inner p-2">
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => setContent(editor.getData())}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: '#2563eb' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-lg shadow-lg transition-all"
          >
            Post
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCreateBlog;
