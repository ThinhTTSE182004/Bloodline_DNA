import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaFacebookF, FaLink, FaArrowLeft } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { motion } from 'framer-motion';

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  // Fetch blog detail from API
  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching blog detail for ID:', blogId);
        
        // Thử với token trước
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`https://localhost:7113/api/Admin/blogs/${blogId}`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          // Nếu lỗi 401/403, thử fetch từ danh sách blog chung
          if (response.status === 401 || response.status === 403) {
            console.log('Trying to find blog from public list...');
            const allBlogsResponse = await fetch('https://localhost:7113/api/Admin/blogs', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (allBlogsResponse.ok) {
              const allBlogs = await allBlogsResponse.json();
              const foundBlog = allBlogs.find(blog => blog.blogId === parseInt(blogId));
              
              if (foundBlog) {
                console.log('Blog found from public list:', foundBlog);
                setPost(foundBlog);
                
                // Set related posts
                const related = allBlogs.filter(blog => blog.blogId !== parseInt(blogId)).slice(0, 2);
                setRelatedPosts(related);
                
                // Set all posts (excluding current one)
                const allOtherPosts = allBlogs.filter(blog => blog.blogId !== parseInt(blogId));
                setAllPosts(allOtherPosts);
              } else {
                throw new Error('Blog not found in public list');
              }
            } else {
              throw new Error(`Failed to fetch blogs list: ${allBlogsResponse.status}`);
            }
          } else {
            throw new Error(`Failed to fetch blog: ${response.status}`);
          }
        } else {
          const data = await response.json();
          console.log('Blog detail loaded (authenticated):', data);
          setPost(data);
          
          // Fetch related posts and all posts
          try {
            const allBlogsResponse = await fetch('https://localhost:7113/api/Admin/blogs', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (allBlogsResponse.ok) {
              const allBlogs = await allBlogsResponse.json();
              const related = allBlogs.filter(blog => blog.blogId !== parseInt(blogId)).slice(0, 2);
              setRelatedPosts(related);
              
              // Set all posts (excluding current one)
              const allOtherPosts = allBlogs.filter(blog => blog.blogId !== parseInt(blogId));
              setAllPosts(allOtherPosts);
            }
          } catch (relatedErr) {
            console.log('Could not fetch related posts:', relatedErr);
            setRelatedPosts([]);
            setAllPosts([]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching blog detail:', err);
        setError('Failed to load blog. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlogDetail();
    }
  }, [blogId]);

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Tag click handler
  const handleTagClick = (tag) => {
    navigate(`/blog/tag/${tag}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-3 text-blue-600 text-lg font-medium">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            Loading blog...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
        <div className="text-center py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 font-medium mb-2">Error Loading Blog</div>
            <div className="text-red-500 text-sm mb-4">{error}</div>
            <button
              onClick={() => navigate('/blog')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Blog List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
        <div className="text-center py-20">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-gray-600 font-medium mb-2">Blog Not Found</div>
            <div className="text-gray-500 text-sm mb-4">The blog post you're looking for doesn't exist.</div>
            <button
              onClick={() => navigate('/blog')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Blog List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate('/admin/blogs')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <FaArrowLeft />
        Back to Blog Management
      </motion.button>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-4xl font-bold text-center mb-6"
      >
        {post.title}
      </motion.h1>

      {/* Metadata */}
      <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-xs sm:text-sm mb-6">
        <div className="flex items-center gap-2">
          <FaUser className="text-blue-600" /> Admin
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-green-600" /> {formatDate(post.createdAt)}
        </div>
      </div>

      {/* Cover Image */}
      <motion.img
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        src="/img/blog-1.png"
        alt={post.title}
        className="w-full h-48 sm:h-64 object-cover rounded-xl shadow mb-8 transition-transform duration-300 hover:scale-105"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="prose prose-lg max-w-none prose-p:text-black prose-blockquote:border-l-blue-500 prose-img:rounded-xl prose-ul:list-disc prose-ul:pl-6 prose-li:pl-1 prose-li:marker:text-black"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />



      {/* Share */}
      <div className="flex items-center gap-4 mb-10 flex-wrap">
        <span className="text-gray-700 font-semibold">Share:</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          title="Facebook"
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow"
        >
          <FaFacebookF />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          title="Zalo"
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow"
        >
          <SiZalo />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          title="Copy Link"
          onClick={handleCopyLink}
          className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition shadow relative"
        >
          <FaLink />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow animate-fade-in-out z-10">
              Link copied!
            </span>
          )}
        </motion.button>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Related Posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {relatedPosts.map((rel) => (
              <motion.div
                key={rel.blogId}
                whileHover={{ scale: 1.07, boxShadow: '0 12px 32px rgba(37,99,235,0.18)' }}
                className="bg-white rounded-xl overflow-hidden shadow group cursor-pointer border border-gray-100 hover:border-blue-400 transition-all duration-300"
                onClick={() => navigate(`/blog/${rel.blogId}`)}
              >
                <img
                  src="/img/blog-1.png"
                  alt={rel.title}
                  className="h-40 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="p-4">
                  <h4 className="text-gray-900 font-medium text-base group-hover:text-blue-600 transition">
                    {rel.title}
                  </h4>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatDate(rel.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Other Posts */}
      {allPosts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center">More Articles</h3>
          <div className="grid grid-cols-1 gap-6">
            {allPosts.slice(0, 1).map((post) => (
              <motion.div
                key={post.blogId}
                whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(37,99,235,0.15)' }}
                className="bg-white rounded-xl overflow-hidden shadow-lg group cursor-pointer border border-gray-100 hover:border-blue-400 transition-all duration-300"
                onClick={() => navigate(`/blog/${post.blogId}`)}
              >
                <img
                  src="/img/blog-1.png"
                  alt={post.title}
                  className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="p-4">
                  <h4 className="text-gray-900 font-semibold text-lg group-hover:text-blue-600 transition mb-2 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;