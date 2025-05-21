import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Lấy số lượng bài viết
      const postsRef = ref(database, 'posts');
      onValue(postsRef, (snapshot) => {
        const posts = snapshot.val() || {};
        const postsCount = Object.keys(posts).length;

        let totalViews = 0;
        Object.values(posts).forEach(post => {
          totalViews += post.viewCount || 0;
        });

        setStats(prevStats => ({
          ...prevStats,
          totalPosts: postsCount,
          totalViews
        }));
      });

      // Lấy số lượng người dùng
      const usersRef = ref(database, 'users');
      onValue(usersRef, (snapshot) => {
        const users = snapshot.val() || {};
        const usersCount = Object.keys(users).length;

        setStats(prevStats => ({
          ...prevStats,
          totalUsers: usersCount
        }));
      });

      // Lấy số lượng bình luận
      const commentsRef = ref(database, 'comments');
      onValue(commentsRef, (snapshot) => {
        const commentsData = snapshot.val() || {};
        let commentsCount = 0;

        Object.values(commentsData).forEach(postComments => {
          commentsCount += Object.keys(postComments).length;
        });

        setStats(prevStats => ({
          ...prevStats,
          totalComments: commentsCount
        }));
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Bảng điều khiển</h1>

          <div className="admin-actions">
            <Link to="/admin/posts/create" className="btn btn-primary">
              <i className="fas fa-plus-circle"></i> Tạo bài viết mới
            </Link>
          </div>
        </div>

        <div className="admin-dashboard">
          <div className="stat-card">
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-label">Bài viết</div>
            <i className="fas fa-file-alt stat-icon"></i>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Người dùng</div>
            <i className="fas fa-users stat-icon"></i>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.totalComments}</div>
            <div className="stat-label">Bình luận</div>
            <i className="fas fa-comments stat-icon"></i>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.totalViews}</div>
            <div className="stat-label">Lượt xem</div>
            <i className="fas fa-eye stat-icon"></i>
          </div>
        </div>

        <div className="recent-activities">
          <h2 className="section-title">Hoạt động gần đây</h2>
          <div className="activity-placeholder">
            <p>Chưa có hoạt động nào gần đây.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
