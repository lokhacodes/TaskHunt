import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, addComment, deleteComment, deletePost } from '../api';
import { toast } from 'react-toastify';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { BiCommentDetail } from 'react-icons/bi';
import '../styles/Feed.css';


//Helpers
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const isLiked = user ? likes.includes(user.username) : false;
  const isOwner = user && user.username === post.username;

  //Like toggle
  const handleLike = async () => {
    if (!user) return;
    setLoadingLike(true);
    try {
      const res = await likePost(post._id);
      setLikes(res.data.likes);
    } catch {
      toast.error('Failed to update like');
    } finally {
      setLoadingLike(false);
    }
  };

  //Submit comment 
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setLoadingComment(true);
    try {
      const res = await addComment(post._id, commentText.trim());
      setComments(res.data.comments);
      setCommentText('');
      setShowComments(true);
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoadingComment(false);
    }
  };

  //Delete comment 
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(post._id, commentId);
      setComments(res.data.comments);
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  //Delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post._id);
      toast.success('Post deleted');
      onDelete(post._id);
    } catch {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-card__header">
        <div className="post-card__user-info">
          <div className="avatar">{getInitial(post.username)}</div>
          <div>
            <h4>@{post.username}</h4>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        {isOwner && (
          <button className="post-card__menu-btn" onClick={handleDeletePost} title="Delete post">
            ✕
          </button>
        )}
      </div>

      {/* Text */}
      {post.text && <p className="post-card__text">{post.text}</p>}

      {/* Image */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" className="post-card__image" loading="lazy" />
      )}

      {/* Stats */}
      

      {/* Action buttons */}
      <div className="post-card__actions">
        {user ? (
          <>
            <button
              className={`action-btn ${isLiked ? 'action-btn--liked' : ''}`}
              onClick={handleLike}
              disabled={loadingLike}
            >
              <span className="action-btn__icon">
                {isLiked ? <FaHeart color="#ff4d94" /> : <FaRegHeart />}
              </span>
              <span className="action-btn__count">{likes.length > 0 ? likes.length : null}</span>
            </button>
            <button
              className="action-btn"
              onClick={() => setShowComments(!showComments)}
            >
              <span className="action-btn__icon">
                <BiCommentDetail />
              </span>
              <span className="action-btn__count">{comments.length > 0 ? comments.length : null}</span>
            </button>
          </>
        ) : (
          <div className="login-prompt" style={{ flex: 1 }}>
            <Link to="/login">Login</Link> to like and comment
          </div>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="comments-section">
          {/* Existing comments */}
          {comments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="avatar avatar-sm">{getInitial(c.username)}</div>
              <div className="comment-item__body">
                <span className="comment-item__username">@{c.username}</span>
                <p className="comment-item__text">{c.text}</p>
                <div className="comment-item__footer">
                  <span className="comment-item__time">{timeAgo(c.createdAt)}</span>
                  {user && user.username === c.username && (
                    <button
                      className="comment-item__delete"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add comment */}
          {user && (
            <div className="comment-input-row">
              <div className="avatar avatar-sm">{getInitial(user.username)}</div>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment(e)}
                maxLength={500}
              />
              <button
                className="comment-submit-btn"
                onClick={handleComment}
                disabled={loadingComment || !commentText.trim()}
              >
                ➤
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;