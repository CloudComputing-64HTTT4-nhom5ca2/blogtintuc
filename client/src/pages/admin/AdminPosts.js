import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../../firebase';
import AdminSidebar from '../../components/AdminSidebar';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const postsRef = ref(database, 'posts');

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val() || {};

      // Chuyển đổi object thành array và sắp xếp theo thời gian tạo (mới nhất lên đầu)
      const postsArray = Object.keys(postsData).map(key => ({
        id: key,
        ...postsData[key]
      })).sort((a, b) => b.createdAt - a.createdAt);

      setPosts(postsArray);
      setLoading(false);
    });

    // Hủy đăng ký listener khi component unmount
    return () => unsubscribe();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await remove(ref(database, `posts/${postId}`));
        setMessage('Bài viết đã được xóa thành công!');

        // Tự động xóa thông báo sau 3 giây
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } catch (error) {
        setError('Có lỗi xảy ra khi xóa bài viết.');
        console.error('Lỗi xóa bài viết:', error);

        // Tự động xóa thông báo lỗi sau 3 giây
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Quản lý bài viết</h1>

          <div className="admin-actions">
            <Link to="/admin/posts/create" className="btn btn-primary">
              <i className="fas fa-plus-circle"></i> Tạo bài viết mới
            </Link>
          </div>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="posts-table-container">
            {posts.length > 0 ? (
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Ngày tạo</th>
                    <th>Lượt xem</th>
                    <th>Đánh giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <div className="post-title-cell">
                          {post.imageUrl && (
                            <div className="post-thumb">
                              <img src={post.imageUrl} alt={post.title} />
                            </div>
                          )}
                          <div className="post-info">
                            <Link to={`/post/${post.id}`} className="post-title-link">
                              {post.title}
                            </Link>
                            {post.category && (
                              <span className="post-category">{post.category}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{post.authorName || 'Không xác định'}</td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td>{post.viewCount || 0}</td>
                      <td>
                        {post.averageRating
                          ? `${post.averageRating.toFixed(1)}/5 (${post.ratingCount})`
                          : 'Chưa có đánh giá'}
                      </td>
                      <td>
                        <div className="post-actions">
                          <Link to={`/admin/posts/edit/${post.id}`} className="btn-edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="btn-delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-posts">
                <p>Chưa có bài viết nào. Hãy tạo bài viết mới!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPosts;
