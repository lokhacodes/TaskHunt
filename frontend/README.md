# SocialFeed — React + Node/Express + MongoDB

SocialFeed is a full-stack social app where users can:
- Sign up / log in (JWT auth)
- Create posts with optional image uploads (Cloudinary)
- Like posts (toggle)
- Comment on posts (add/delete own comments)
- Browse a paginated feed

This is a monorepo-style project with two packages:
- **frontend/**: React (Create React App)
- **Backend/**: Node.js/Express + MongoDB

---

## Quick architecture overview

### Frontend (React)
- **Routing & auth gate**: `src/App.js`
  - `/` is protected with `RequireAuth` (redirects to `/login` when not authenticated)
- **Auth state**: `src/context/AuthContext.js`
  - Stores JWT in `localStorage`
  - Restores session by calling `GET /api/auth/me`
- **API client**: `src/api/api.js` (+ re-exports in `src/api/index.js`)
  - Uses Axios with an interceptor to attach `Authorization: Bearer <token>`
- **Main feed UI**: `src/pages/Feed.js`
  - Fetches posts with pagination
  - Shows a “Join SocialFeed” banner when not logged in
  - Renders `CreatePost` and `PostCard` components
- **Post creation**: `src/components/CreatePost.js`
  - Sends a `FormData` payload to `POST /api/posts`
  - Image uploads are handled by the backend + Cloudinary
- **Post interaction**: `src/components/PostCard.js`
  - Like toggle: `PUT /api/posts/:id/like`
  - Add comment: `POST /api/posts/:id/comment`
  - Delete comment (only if the current user owns it)
  - Delete post (only if the current user is the owner)

### Backend (Express)
- **Server bootstrap**: `Backend/index.js`
  - Adds CORS + JSON body parsing
  - Connects to MongoDB using `process.env.MONGO_URI`
  - Mounts:
    - `/api/auth` → `Backend/routes/auth.js`
    - `/api/posts` → `Backend/routes/posts.js`
- **JWT protection**: `Backend/middleware/auth.js`
  - `protect` middleware reads `Authorization: Bearer ...`
  - Verifies JWT and attaches `req.user`
- **Cloudinary upload**: `Backend/middleware/cloudinary.js`
  - Configures Cloudinary using environment variables
  - Uses `multer-storage-cloudinary` + `multer` for `upload.single('image')`
- **Data models**:
  - `Backend/models/User.js`
    - Hashes passwords via `bcryptjs`
    - Provides `matchPassword()`
  - `Backend/models/Post.js`
    - Stores `text`, `imageUrl`, `imagePublicId`, `likes`, `comments`

---

## Features & API (high level)

### Authentication
- `POST /api/auth/signup`
  - Validates input with `express-validator`
  - Creates a user (password hashed)
  - Returns `{ token, username, email, _id }`
- `POST /api/auth/login`
  - Validates input
  - Checks password
  - Returns JWT and user data
- `GET /api/auth/me`
  - Protected by `protect`
  - Returns current user info (no password)

### Posts / Feed
- `GET /api/posts`
  - Public feed
  - Supports pagination via query params:
    - `page` (default 1)
    - `limit` (default 10)
  - Sorted by `createdAt` descending
- `POST /api/posts` (protected)
  - Requires auth
  - Accepts:
    - `text` (optional)
    - `image` (optional, multipart upload)
  - Enforces: at least one of `text` or `image` must be provided
  - If image is uploaded, the backend stores:
    - `imageUrl` (Cloudinary URL)
    - `imagePublicId` (used for deletion)
- `DELETE /api/posts/:id` (protected)
  - Only the post owner can delete
  - Deletes Cloudinary asset if `imagePublicId` exists

### Likes
- `PUT /api/posts/:id/like` (protected)
  - Toggle like/unlike for the current user
  - Likes are stored as an array of usernames

### Comments
- `POST /api/posts/:id/comment` (protected)
  - Requires non-empty `text`
  - Appends a comment with `{ username, userId, text }`
- `DELETE /api/posts/:id/comment/:commentId` (protected)
  - Only the comment author can delete

---

## Environment variables

### Frontend
- `REACT_APP_API_URL` (optional)
  - Base URL for API requests (Axios)
  - Default in code: `http://localhost:3000/api`

### Backend
Required / commonly used variables (refer to `Backend/` middleware):
- `PORT` (optional) — server port (default `3000`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret

Cloudinary (required for image uploads):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Note: `Backend/middleware/cloudinary.js` also supports parsing a `CLOUDINARY_URL` format if the individual vars are not provided.

CORS:
- `Backend/index.js` uses `process.env.CLIENT_URL` (optional)
  - Default: `http://localhost:3000`

---

## Project folder structure

```
Social/
  frontend/
    public/
    src/
      api/
      components/
      context/
      pages/
      styles/
      App.js
      index.js
    package.json
    README.md

  Backend/
    middleware/
      auth.js
      cloudinary.js
    models/
      Post.js
      User.js
    routes/
      auth.js
      posts.js
    index.js
    package.json
```

---

## How to run

> Run **frontend** and **backend** as two separate processes.

### Backend
1. Go to `Backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the required variables (`MONGO_URI`, `JWT_SECRET`, Cloudinary vars, etc.)
4. Start the server:
   ```bash
   npm start
   ```

Backend listens on:
- `http://localhost:3000` (default)
- API routes are under `/api/...`

### Frontend
1. Go to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) set `REACT_APP_API_URL` in `.env`
4. Start the app:
   ```bash
   npm start
   ```

Frontend typically runs on:
- `http://localhost:3000`



