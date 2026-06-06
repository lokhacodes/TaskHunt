import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import '../styles/Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getPosts(pageNum);
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  // Prepend new post to feed
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Remove deleted post from feed
  const handlePostDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="feed-page">
      <div className="container">
        {/* Banner for unauthenticated users */}
        {!user && (
          <div className="auth-banner">
            <div>
              <h3>Join SocialFeed</h3>
              <p>Create an account to post, like, and comment.</p>
            </div>
            <div className="auth-banner__actions">
              <Link to="/login" className="btn-white-outline">Login</Link>
              <Link to="/signup" className="btn-white">Sign Up</Link>
            </div>
          </div>
        )}

        {/* Create post — only for logged in users */}
        {user && <CreatePost onPostCreated={handlePostCreated} />}

        {/* Feed heading */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
          📰 Latest Posts
        </h2>

        {/* Loading spinner */}
        {loading && (
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        )}

        {/* Posts */}
        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3>No posts yet</h3>
            <p>Be the first one to post something!</p>
          </div>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination__btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="pagination__info">
              Page {page} of {totalPages}
            </span>
            <button
              className="pagination__btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;



