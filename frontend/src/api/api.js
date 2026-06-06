import axios from 'axios';

// Base API instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Auth endpoints
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

//Post endpoints 
export const getPosts = (page = 1) => API.get(`/posts?page=${page}&limit=10`);
export const createPost = (formData) => API.post('/posts', formData); // FormData for image
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const addComment = (id, text) => API.post(`/posts/${id}/comment`, { text });
export const deleteComment = (postId, commentId) => API.delete(`/posts/${postId}/comment/${commentId}`);

export default API;