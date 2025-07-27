import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BlogDetailGuest = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/Admin/public-blogs/${blogId}`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError('No posts found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) return <div className="text-center py-20">Đang tải bài viết...</div>;
  if (error) return (
    <div className="text-center py-20 text-red-600">
      {error}
      <button onClick={() => navigate('/blog')} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">Back to Blog List</button>
      <button onClick={() => navigate('/')} className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Back to Home</button>
    </div>
  );
  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <img src={post.imageUrl || '/img/blog-1.png'} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="text-gray-500 mb-6">
        <span>By {post.authorName || post.authorId}</span> | <span>{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
      </div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      <button onClick={() => navigate('/blog')} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Back to Blog List</button>
      <button onClick={() => navigate('/')} className="mt-8 ml-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Back to Home</button>
    </div>
  );
};

export default BlogDetailGuest;