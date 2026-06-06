const mongoose = require('mongoose');

// ─── Comment Sub-Schema ───────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
    },
  },
  { timestamps: true }
);

// ─── Post Schema ──────────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    // Text content (optional if image exists)
    text: {
      type: String,
      maxlength: [1000, 'Post text cannot exceed 1000 characters'],
      trim: true,
      default: '',
    },
    // Image URL from Cloudinary (optional if text exists)
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    // Likes: array of usernames who liked
    likes: {
      type: [String],
      default: [],
    },
    // Comments array
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual for counts (convenience)
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);