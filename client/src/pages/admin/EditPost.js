import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update, serverTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/ImageUploader';
import AdminSidebar from '../../components/AdminSidebar';

const EditPost = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = ref(database, `posts/${id}`);
        const snapshot = await get(postRef);

        if (snapshot.exists()) {
          const postData = snapshot.val();

          setTitle(postData.title || '');
          setContent(postData.content || '');
          setCategory(postData.category || '');
          setTags((postData.tags || []).join(', '));
          setImageUrl(postData.imageUrl || '');
        } else {
          setError('Không tìm thấy bài viết');
        }
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleImageSelected = (file, preview) => {
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    if (!title || !content || !category) {
      setError('Vui lòng điền đầy đủ thông tin (tiêu đề, nội dung, danh mục)');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let updatedImageUrl = imageUrl;

      // Nếu có hình ảnh mới, tải lên Cloud Storage
      if (image) {
        const imageStorageRef = storageRef(storage, `images/${Date.now()}_${image.name}`);
        await uploadBytes(imageStorageRef, image);
        updatedImageUrl = await getDownloadURL(imageStorageRef);
      }

      // Cập nhật bài viết
      const postRef = ref(database, `posts/${id}`);

      await update(postRef, {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl: updatedImageUrl,
        updatedAt: serverTimestamp()
      });

      // Chuyển hướng đến trang quản lý bài viết
      navigate('/admin/posts');

    } catch (error) {
      console.error('Lỗi khi cập nhật bài viết:', error);
      setError('Không thể cập nhật bài viết. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Chỉnh sửa bài viết</h1>
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
            <ImageUploader
              onImageSelected={handleImageSelected}
              currentImage={imageUrl}
            />
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
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
