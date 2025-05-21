import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  // Kiểm tra xem liên kết có đang active không
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">
          <i className="fas fa-cogs"></i> Quản trị
        </h2>
      </div>

      <ul className="admin-menu">
        <li>
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
            <i className="fas fa-tachometer-alt"></i> Bảng điều khiển
          </Link>
        </li>
        <li>
          <Link to="/admin/posts" className={isActive('/admin/posts') ? 'active' : ''}>
            <i className="fas fa-file-alt"></i> Bài viết
          </Link>
        </li>
        <li>
          <Link to="/admin/posts/create" className={isActive('/admin/posts/create') ? 'active' : ''}>
            <i className="fas fa-plus-circle"></i> Tạo bài viết
          </Link>
        </li>
        <li>
          <Link to="/admin/comments" className={isActive('/admin/comments') ? 'active' : ''}>
            <i className="fas fa-comments"></i> Bình luận
          </Link>
        </li>
        <li>
          <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
            <i className="fas fa-users"></i> Người dùng
          </Link>
        </li>
        <li>
          <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>
            <i className="fas fa-cog"></i> Cài đặt
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
