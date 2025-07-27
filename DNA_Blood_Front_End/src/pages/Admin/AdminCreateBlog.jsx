import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiArrowLeft, FiDownload, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminCreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const navigate = useNavigate();
  const quillRef = useRef();
  const fileInputRef = useRef();

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blog_unsigned');
    const res = await fetch('https://api.cloudinary.com/v1_1/duqp1ecoj/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const imageHandler = () => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();
  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      const url = await uploadImageToCloudinary(file);
      const quill = quillRef.current.getEditor();
      let range = quill.getSelection();
      if (!range) {
        range = { index: quill.getLength(), length: 0 };
      }
      quill.insertEmbed(range.index, 'image', url);
      quill.insertText(range.index + 1, '\\n');
      setTimeout(() => {
        quill.focus();
        quill.setSelection(range.index + 2, 0, 'user');
      }, 0);
    }
  };
};

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

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Please enter both title and content!');
      return;
    }
    if (!imageUrl) {
      alert('Please select a thumbnail image!');
      return;
    }
    setPosting(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/Admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          content,
          imageUrl
        })
      });
      if (!res.ok) throw new Error('Failed to create blog');
      alert('Blog post added successfully!');
      setTitle('');
      setContent('');
      setImageUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert('Error creating blog!');
    } finally {
      setPosting(false);
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
        className="w-full max-w-6xl mx-auto bg-white/95 shadow-2xl rounded-3xl p-10 border border-blue-100 z-10 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#e0e7ff' }}
            className="p-2 rounded-full bg-blue-50 text-blue-600 shadow hover:bg-blue-100 transition text-2xl"
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
        {/* Blog Title */}
        <motion.input
          whileFocus={{ borderColor: '#2563eb' }}
          type="text"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-blue-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all text-xl font-semibold mb-1"
        />
        {/* Thumbnail image upload - moved up */}
        <div className="flex flex-col items-center justify-center mt-2 mb-0 w-full">
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Custom upload button */}
            {!imageUrl && (
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold shadow border border-blue-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => document.getElementById('blog-thumbnail-input').click()}
                disabled={uploading}
              >
                <FiDownload className="text-xl" />
                Choose thumbnail image
              </button>
            )}
            <input
              ref={fileInputRef}
              id="blog-thumbnail-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setUploading(true);
                const url = await uploadImageToCloudinary(file);
                setImageUrl(url);
                setUploading(false);
              }}
              disabled={uploading}
            />
            {uploading && (
              <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
                <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading...
              </div>
            )}
            {imageUrl && (
              <div className="mt-1 border-2 border-blue-200 rounded-2xl p-2 bg-blue-50 shadow-md flex flex-col items-center relative">
                <img
                  src={imageUrl}
                  alt="Blog thumbnail"
                  className="max-w-[180px] max-h-[140px] rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer border border-blue-300"
                  style={{ objectFit: 'cover' }}
                  title="Click to view larger"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
                <span className="text-xs text-gray-500 mt-1">Preview image</span>
                <button
                  className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full p-1 shadow transition"
                  title="Remove image"
                  onClick={() => {
                    setImageUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  type="button"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Editor ReactQuill giống hệt AdminBlogList update, card co giãn theo nội dung */}
        <div className={`w-full flex flex-col bg-white rounded-3xl border transition-all duration-300 ${isFocused ? 'border-blue-400 shadow-2xl ring-2 ring-blue-200' : 'border-blue-100 shadow'} quill-placeholder-indent`}>
          <div className="flex flex-col p-6 quill-fix-placeholder
            [&_.ql-toolbar]:flex [&_.ql-toolbar]:flex-nowrap [&_.ql-toolbar]:items-center
            [&_.ql-toolbar]:gap-2 [&_.ql-toolbar]:text-xl
            [&_.ql-toolbar]:min-h-[56px] [&_.ql-toolbar]:py-3
            [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:rounded-none [&_.ql-toolbar]:bg-transparent
            [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-blue-100
            [&_.ql-container]:min-h-[200px] [&_.ql-container]:overflow-y-auto [&_.ql-container]:overflow-x-hidden [&_.ql-container]:border-0
            [&_.ql-editor]:rounded-none [&_.ql-editor]:bg-transparent [&_.ql-editor]:pt-3 [&_.ql-editor]:px-6 [&_.ql-editor]:pb-3 [&_.ql-editor]:break-words [&_.ql-editor]:whitespace-pre-line [&_.ql-editor]:text-lg">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content || ''}
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
        <div className="w-full flex justify-end mt-4">
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: '#2563eb' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className={`px-10 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xl shadow-lg transition-all flex items-center gap-3
              ${posting || uploading || !title || !content || !imageUrl ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            disabled={posting || uploading || !title || !content || !imageUrl}
          >
            {posting && (
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
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
