import React, { useEffect, useState } from 'react';
import { database } from '../../firebase';
import { ref, onValue, remove } from 'firebase/database';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const commentsRef = ref(database, 'comments/');
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      const commentsList = [];

      if (data) {
        // Duyệt qua từng bài post có comment
        Object.keys(data).forEach(postId => {
          const postComments = data[postId];
          // Duyệt qua từng comment trong bài post
          if (postComments) {
            Object.keys(postComments).forEach(commentId => {
              commentsList.push({
                id: commentId,
                postId,
                ...postComments[commentId]
              });
            });
          }
        });
      }

      setComments(commentsList);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (postId, commentId) => {
    try {
      await remove(ref(database, `comments/${postId}/${commentId}`));
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Quản lý bình luận</h1>
          <div className="admin-actions">
            <span className="admin-count">{comments.length} bình luận</span>
          </div>
        </div>

        <div className="posts-table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nội dung</th>
                <th>Người dùng</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <tr key={comment.id}>
                    <td>{truncateText(comment.id, 8)}</td>
                    <td>{truncateText(comment.content, 50)}</td>
                    <td>{comment.userName || 'Người dùng ẩn danh'}</td>
                    <td>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(comment.postId, comment.id)}
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">Chưa có bình luận nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageComments;
