import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';

const AdminCreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // Thêm state cho ảnh đại diện
  const [uploading, setUploading] = useState(false); // State loading khi upload ảnh
  const [posting, setPosting] = useState(false); // Thêm state loading khi gửi blog
  const navigate = useNavigate();
  const quillRef = useRef();

  // Hàm upload ảnh lên Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blog_unsigned'); // Tên preset bạn đã tạo
    const res = await fetch('https://api.cloudinary.com/v1_1/duqp1ecoj/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  // Custom image handler cho ReactQuill
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
      // Chèn thêm một dòng trống sau ảnh
      quill.insertText(range.index + 1, '\\n');
      setTimeout(() => {
        quill.focus();
        quill.setSelection(range.index + 2, 0, 'user');
      }, 0);
    }
  };
};

  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['undo', 'redo'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
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
    setPosting(true);
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
          content,
          imageUrl // Gửi kèm link ảnh đại diện
        })
      });
      if (!res.ok) throw new Error('Failed to create blog');
      alert('Blog post added successfully!');
      navigate('/admin/blogs');
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
        className="w-full max-w-2xl bg-white/95 shadow-2xl rounded-3xl px-8 py-8 border border-blue-100 backdrop-blur-md mt-4 relative z-10 flex flex-col gap-4"
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
        {/* Title */}
        <motion.input
          whileFocus={{ borderColor: '#2563eb' }}
          type="text"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-blue-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all text-xl font-semibold mb-1"
        />
        {/* Card nội dung liền mạch */}
        <div className="bg-white rounded-2xl shadow border border-blue-100 px-4 py-6 flex flex-col gap-4">
          {/* Editor giữ nguyên */}
          <div style={{ padding: 0 }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content || ''}
              onChange={setContent}
              placeholder="Write your blog content here..."
            />
          </div>
          {/* Ảnh đại diện */}
          <div className="flex flex-col items-center justify-center mt-2 mb-0">
            <label className="block font-bold mb-2 text-base text-blue-700 text-center">Blog profile picture (optional):</label>
            <div className="flex flex-col items-center gap-2 w-full">
              <input
                type="file"
                accept="image/*"
                className="file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
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
                    title="Click để xem lớn"
                    onClick={() => window.open(imageUrl, '_blank')}
                  />
                  <span className="text-xs text-gray-500 mt-1">Preview image</span>
                  <button
                    className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full p-1 shadow transition"
                    title="Xóa ảnh"
                    onClick={() => setImageUrl('')}
                    type="button"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Nút Post ngoài card */}
          <div className="w-full flex justify-end mt-4">
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: '#2563eb' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className={`px-10 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xl shadow-lg transition-all flex items-center gap-3
                ${posting || uploading || !title || !content ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              disabled={posting || uploading || !title || !content}
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
