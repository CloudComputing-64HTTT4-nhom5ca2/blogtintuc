import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/ImageUploader';
import AdminSidebar from '../../components/AdminSidebar';

const CreatePost = () => {
  const { currentUser, userRole, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("CreatePost - Current user:", currentUser);
    console.log("CreatePost - User role:", userRole);
    console.log("CreatePost - Is admin:", isAdmin);
  }, [currentUser, userRole, isAdmin]);

  const handleImageSelected = (file, preview) => {
    setImage(file);
    setImagePreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");

    // Kiểm tra các trường bắt buộc
    if (!title || !content || !category) {
      setError('Vui lòng điền đầy đủ thông tin (tiêu đề, nội dung, danh mục)');
      return;
    }

    console.log("Validation passed, preparing to create post");
    setLoading(true);
    setError('');

    try {
      console.log("Current user before creating post:", currentUser);
      if (!currentUser || !isAdmin) {
        console.error("User not authenticated or not admin");
        setError('Bạn không có quyền tạo bài viết');
        setLoading(false);
        return;
      }

      let imageUrl = '';

      // Nếu có hình ảnh, tải lên Cloud Storage
      if (image) {
        console.log("Uploading image to Firebase Storage");
        const imageStorageRef = storageRef(storage, `images/${Date.now()}_${image.name}`);
        await uploadBytes(imageStorageRef, image);
        imageUrl = await getDownloadURL(imageStorageRef);
        console.log("Image uploaded successfully:", imageUrl);
      }

      // Tạo bài viết mới
      console.log("Creating new post in Firebase Realtime Database");
      const postsRef = ref(database, 'posts');
      const newPostRef = push(postsRef);

      // Sử dụng update thay vì set
      const updates = {};
      updates[`/posts/${newPostRef.key}`] = {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl,
        author: currentUser.uid,
        authorName: currentUser.displayName || 'Admin',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        viewCount: 0,
        averageRating: 0,
        ratingCount: 0
      };

      // Cập nhật database
      await update(ref(database), updates);

      console.log("Post created successfully");
      // Chuyển hướng đến trang quản lý bài viết
      navigate('/admin/posts');

    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error);
      setError('Không thể tạo bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Tạo bài viết mới</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Danh mục *</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Thẻ (cách nhau bởi dấu phẩy)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tin tức, Công nghệ, ..."
            />
          </div>

          <div className="form-group">
            <label>Hình ảnh</label>
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin/posts')} className="btn-secondary">
              Hủy bỏ
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Đang tạo...' : 'Tạo bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
