import React, { useState, useRef } from 'react';
import { createPost } from '../api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import '../styles/Feed.css';

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 5MB limit check
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExpanded(true);
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    fileRef.current.value = '';
  };

  // Submit post
  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      toast.warning('Add some text or an image to post');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await createPost(formData);
      onPostCreated(res.data);

      // Reset form
      setText('');
      setImageFile(null);
      setImagePreview('');
      setExpanded(false);
      if (fileRef.current) fileRef.current.value = '';

      toast.success('Post created! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      {!expanded ? (
        /* Collapsed view */
        <div className="create-post-card__header">
          <div className="avatar">{getInitial(user?.username)}</div>
          <button
            className="create-post-card__input-trigger"
            onClick={() => setExpanded(true)}
          >
            What's on your mind, {user?.username}?
          </button>
        </div>
      ) : (
        /* Expanded form */
        <div className="create-post-form">
          <div className="create-post-card__header" style={{ marginBottom: 0 }}>
            <div className="avatar">{getInitial(user?.username)}</div>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>@{user?.username}</strong>
          </div>

          <textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            autoFocus
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="create-post-form__image-preview">
              <img src={imagePreview} alt="preview" />
              <button className="create-post-form__remove-img" onClick={removeImage}>✕</button>
            </div>
          )}

          {/* Actions bar */}
          <div className="create-post-form__actions">
            <div className="create-post-form__tools">
              <button
                className="icon-btn"
                onClick={() => fileRef.current.click()}
                type="button"
              >
                📷 Photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <button
                className="icon-btn"
                onClick={() => { setExpanded(false); setText(''); removeImage(); }}
                type="button"
              >
                Cancel
              </button>
            </div>

            <button
              className="btn btn-post"
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !imageFile)}
            >
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;