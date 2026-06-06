const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/cloudinary');

// ─── GET /api/posts ───────────────────────────────────────────────────────────
// Public feed - all posts, newest first, with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error('Fetch posts error:', error.message);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// ─── POST /api/posts ──────────────────────────────────────────────────────────
// Create a post (text, image, or both) — requires auth
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const imageUrl = req.file ? req.file.path : '';
    const imagePublicId = req.file ? req.file.filename : '';

    // At least one of text or image must be provided
    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post must have text or an image' });
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      text: text || '',
      imageUrl,
      imagePublicId,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
// Delete own post — requires auth
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only the post owner can delete
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error.message);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// ─── PUT /api/posts/:id/like ──────────────────────────────────────────────────
// Toggle like on a post — requires auth
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const username = req.user.username;
    const alreadyLiked = post.likes.includes(username);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((u) => u !== username);
    } else {
      // Like
      post.likes.push(username);
    }

    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (error) {
    console.error('Like error:', error.message);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

// ─── POST /api/posts/:id/comment ─────────────────────────────────────────────
// Add a comment — requires auth
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      username: req.user.username,
      userId: req.user._id,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Return the last added comment
    const savedComment = post.comments[post.comments.length - 1];
    res.status(201).json({ comment: savedComment, comments: post.comments });
  } catch (error) {
    console.error('Comment error:', error.message);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// ─── DELETE /api/posts/:id/comment/:commentId ─────────────────────────────────
// Delete own comment — requires auth
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();
    res.json({ message: 'Comment deleted', comments: post.comments });
  } catch (error) {
    console.error('Delete comment error:', error.message);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

module.exports = router;