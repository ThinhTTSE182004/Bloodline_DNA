import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';

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

const AdminCreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-6 px-2 sm:px-4 flex justify-center items-center">
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
        className="w-full max-w-6xl max-h-[calc(100vh-48px)] overflow-y-auto bg-white/95 shadow-2xl rounded-3xl p-4 sm:p-10 border border-blue-100 backdrop-blur-md mt-4 relative z-10"
      >
        <div className="flex items-center gap-6 mb-8 w-full">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#e0e7ff' }}
            className="p-3 rounded-full bg-blue-50 text-blue-600 shadow hover:bg-blue-100 transition text-2xl"
            onClick={() => navigate('/admin/blogs')}
            title="Back to list"
          >
            <FiArrowLeft className="text-2xl" />
          </motion.button>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold text-blue-700 drop-shadow-lg"
          >
            Create New Blog Post
          </motion.h2>
        </div>
        {/* Title */}
        <motion.input
          whileFocus={{ borderColor: '#2563eb' }}
          type="text"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-blue-200 rounded-3xl px-7 py-5 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all text-2xl"
        />
        {/* Content Editor Card */}
        <div className={`w-full flex flex-col h-[300px] bg-white rounded-3xl border transition-all duration-300 ${isFocused ? 'border-blue-400 shadow-2xl ring-2 ring-blue-200' : 'border-blue-100 shadow'} quill-placeholder-indent`}>
          <div className="flex flex-col p-6 quill-fix-placeholder
            [&_.ql-toolbar]:flex [&_.ql-toolbar]:flex-nowrap [&_.ql-toolbar]:items-center
            [&_.ql-toolbar]:gap-2 [&_.ql-toolbar]:text-xl
            [&_.ql-toolbar]:min-h-[56px] [&_.ql-toolbar]:py-3
            [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:rounded-none [&_.ql-toolbar]:bg-transparent
            [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-blue-100
            [&_.ql-container]:h-[200px] [&_.ql-container]:max-h-[200px] [&_.ql-container]:overflow-y-auto
            [&_.ql-container]:overflow-x-hidden [&_.ql-container]:border-0
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
        {/* Nút Post ngoài card */}
        <div className="w-full flex justify-end mt-8">
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: '#2563eb' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="px-12 py-4 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-2xl shadow-lg transition-all"
          >
            Post
          </motion.button>
        </div>
      </motion.div>
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
    </div>
  );
};

export default AdminCreateBlog;
